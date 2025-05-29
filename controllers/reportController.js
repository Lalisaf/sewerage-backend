import db from '../models/index.js';
const { Request, Sequelize }= db; // Destructure the models from db

// Generate report for completed requests based on the specified period (daily, weekly, monthly)
export const generateReport = async (req, res) => {
  try {
    const { period } = req.params; // 'daily', 'weekly', or 'monthly'

    const groupBy = period === 'daily'
      ? Sequelize.fn('DATE', Sequelize.col('completedAt'))
      : period === 'weekly'
      ? Sequelize.fn('WEEK', Sequelize.col('completedAt'))
      : Sequelize.fn('MONTH', Sequelize.col('completedAt'));

    const report = await Request.findAll({
      where: { status: 'completed' },
      attributes: [
        [groupBy, 'period'],
        [Sequelize.fn('COUNT', '*'), 'count'],
        [
          Sequelize.fn(
            'AVG',
            Sequelize.fn(
              'TIMESTAMPDIFF',
              Sequelize.literal('MINUTE'),
              Sequelize.col('createdAt'),
              Sequelize.col('completedAt')
            )
          ),
          'avgCompletionTime'
        ]
      ],
      group: ['period'],
      order: [[groupBy, 'ASC']]
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Predict demand based on request creation times (hourly)
export const predictDemand = async (req, res) => {
  try {
    const predictions = await Request.findAll({
      attributes: [
        [Sequelize.fn('HOUR', Sequelize.col('createdAt')), 'hour'],
        [Sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['hour'],
      order: [['hour', 'ASC']],
      raw: true
    });

    const peakHours = predictions
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);

    res.json({
      predictions,
      peakHours
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
