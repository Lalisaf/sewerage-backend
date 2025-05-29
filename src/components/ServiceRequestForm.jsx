import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaExclamationCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PhotoUpload from '../common/PhotoUpload';
import Button from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { submitServiceRequest } from '../../api/ServiceRequests';
import { useAuth } from '../../contexts/AuthContext';

const ServiceRequestForm = ({onSuccess, defaultValues = {}, requestId }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    problemType: 'blockage',
    urgency: 'medium',
    description: '',
    location: null,
    locationDescription: '',
    requester_id: defaultValues.requesterId  || null,
    ...defaultValues // This line will override defaults with any other incoming props
  });
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapPreview, setMapPreview] = useState(null);

  useEffect(() => {
    if (requestId) {
      // Fetch existing request data to populate form for editing
      const fetchRequest = async () => {
        try {
          const response = await axios.get(`/api/requests/${requestId}`);
          const data = response.data.data || response.data;
          // Normalize data fields for form
          const normalizedData = {
            problemType: data.problemType || 'blockage',
            urgency: data.urgency || 'medium',
            description: data.description || '',
            location: data.location || null,
            locationDescription: data.locationDescription || (data.location && data.location.coordinates ? `${data.location.coordinates[1].toFixed(6)}, ${data.location.coordinates[0].toFixed(6)}` : ''),
            requester_id: data.requesterId || null,
            images: data.images || [],
          };
          setFormData(normalizedData);
          setImages(normalizedData.images.map((url, index) => ({
            file: null,
            preview: url,
            id: `existing-${index}`
          })));
          if (data.location && data.location.coordinates) {
            setMapPreview(
              `https://www.openstreetmap.org/export/embed.html?bbox=${data.location.coordinates[0]-0.01},${data.location.coordinates[1]-0.01},${data.location.coordinates[0]+0.01},${data.location.coordinates[1]+0.01}&layer=mapnik&marker=${data.location.coordinates[1]},${data.location.coordinates[0]}`
            );
          }
        } catch (error) {
          console.error('Failed to fetch request data:', error);
          toast.error('Failed to load request data for editing');
        }
      };
      fetchRequest();
    }
  }, [requestId]);

  const problemTypes = [
    { value: '', label: 'Select' },
    { value: 'blockage', label: 'Blockage' },
    { value: 'leakage', label: 'Leakage' },
    { value: 'overflow', label: 'Overflow' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyLevels = [
    { value: '', label: 'Select' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.problemType) newErrors.problemType = 'Problem type is required';
    if (!formData.urgency) newErrors.urgency = 'Urgency level is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationClick = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationObj = {
            type: 'Point',
            coordinates: [longitude, latitude] // GeoJSON order
          };
          
          setFormData(prev => ({
            ...prev,
            location: locationObj,
            locationDescription: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
          
          // Set OpenStreetMap preview
          setMapPreview(
            `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`
          );
          setLocationLoading(false);
        },
        (error) => {
          toast.error(`Location error: ${error.message}`);
          setLocationLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting your request...');

    try {
      const formDataObj = new FormData();
      formDataObj.append('problemType', formData.problemType);
      formDataObj.append('description', formData.description);
      formDataObj.append('urgency', formData.urgency);
      formDataObj.append('location', JSON.stringify(formData.location));
      formDataObj.append('requester_id', formData.requesterId || '');
      if (user?.user_id) {
        formDataObj.append('requesterId', user.user_id);
      }

      // Separate new files and existing image URLs
      const newFiles = images.filter(img => img.file);
      const existingImageUrls = images.filter(img => !img.file).map(img => img.preview);

      newFiles.forEach(fileObj => {
        formDataObj.append('images', fileObj.file);
      });

      // Append existing image URLs as JSON string
      formDataObj.append('existingImages', JSON.stringify(existingImageUrls));

      let response;
      if (requestId) {
        response = await axios.put(`/api/requests/${requestId}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await submitServiceRequest(formDataObj);
      }
      toast.update(toastId, {
        render: t('request.submitSuccess'),
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      // Fix: response data structure may differ between create and update
      const responseData = response.data.data || response.data;
      const requestIdFromResponse = responseData.request_id || responseData.requestId;

      if (requestIdFromResponse) {
        navigate(`/requests/${requestIdFromResponse}`);
      } else {
        console.warn('Request ID not found in response');
      }

      // Reset form
      setFormData({
        problemType: 'blockage',
        urgency: 'medium',
        description: '',
        location: null,
        locationDescription: '',
        requester_id: defaultValues.requesterId || null,
      });
      setImages([]);
      setMapPreview(null);

      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error('Submission error:', error);
      toast.update(toastId, {
        render: error.response?.data?.error || 'Failed to submit request',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Service Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Problem Type and Urgency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Problem Type *
            </label>
            <select
              name="problemType"
              value={formData.problemType}
              onChange={(e) => setFormData({...formData, problemType: e.target.value})}
              className="w-full p-2 border rounded-md"
              required
            >
              {problemTypes.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency Level *
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={(e) => setFormData({...formData, urgency: e.target.value})}
              className="w-full p-2 border rounded-md"
              required
            >
              {urgencyLevels.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.locationDescription}
              readOnly
              className="flex-1 p-2 border rounded-md"
              placeholder="Click the button to detect your location"
            />
            <Button
              type="button"
              onClick={handleLocationClick}
              disabled={locationLoading}
              className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              {locationLoading ? 'Detecting...' : <FaMapMarkerAlt />}
            </Button>
          </div>
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              <FaExclamationCircle className="inline mr-1" />
              {errors.location}
            </p>
          )}
        </div>

        {/* Map Preview */}
        {mapPreview && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Location Preview:</p>
            <div className="border rounded-md overflow-hidden h-64">
              <iframe
                title="Location Preview"
                src={mapPreview}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
              ></iframe>
            </div>
            {formData.location?.coordinates && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {formData.location.coordinates[1].toFixed(6)}, {formData.location.coordinates[0].toFixed(6)}
              </p>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full p-2 border rounded-md"
            placeholder="Describe the problem in detail..."
            required
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              <FaExclamationCircle className="inline mr-1" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photos (Optional, max 5)
          </label>
          <PhotoUpload 
            onFilesChange={setImages}
            maxFiles={5}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceRequestForm;
