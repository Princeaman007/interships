const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Testimonial = require('../models/Testimonial');
const ContactMessage = require('../models/ContactMessage');
const BlogPost = require('../models/BlogPost');
const Faq = require('../models/Faq');

exports.getAdminDashboardStats = async (req, res) => {
  const range = parseInt(req.query.range);
  const fromDate = range ? new Date(Date.now() - range * 24 * 60 * 60 * 1000) : null;

  try {
    const [
      totalUsers,
      studentCount,
      adminCount,
      internshipCount,
      applicationCount,
      approvedTestimonials,
      contactMessageCount,
      blogCount,
      faqCount,

      usersByCountryRaw,
      applicationsByCountryRaw,

      recentApplications,
      recentMessages,
      recentBlogPosts
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'étudiant' }),
      User.countDocuments({ role: { $in: ['admin', 'superAdmin'] } }),
      Internship.countDocuments(),
      Application.countDocuments(),
      Testimonial.countDocuments({ approved: true }),
      ContactMessage.countDocuments(),
      BlogPost.countDocuments(),
      Faq.countDocuments(),

      // Group users by country
      User.aggregate([
        { $group: { _id: "$profile.country", count: { $sum: 1 } } }
      ]),

      // Group applications by applicant's country
      Application.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'applicant',
            foreignField: '_id',
            as: 'applicant'
          }
        },
        { $unwind: "$applicant" },
        {
          $group: {
            _id: "$applicant.profile.country",
            count: { $sum: 1 }
          }
        }
      ]),

      range
        ? Application.find({ createdAt: { $gte: fromDate } })
            .populate('applicant', 'firstName lastName email')
            .populate('internship', 'translations')
            .sort({ createdAt: -1 })
            .limit(5)
        : [],

      range
        ? ContactMessage.find({ createdAt: { $gte: fromDate } })
            .sort({ createdAt: -1 })
            .limit(5)
        : [],

      range
        ? BlogPost.find({ publishedAt: { $gte: fromDate } })
            .sort({ publishedAt: -1 })
            .limit(5)
        : []
    ]);

    const usersByCountry = usersByCountryRaw.reduce((acc, curr) => {
      if (curr._id) acc[curr._id] = curr.count;
      return acc;
    }, {});

    const applicationsByCountry = applicationsByCountryRaw.reduce((acc, curr) => {
      if (curr._id) acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      users: {
        total: totalUsers,
        students: studentCount,
        admins: adminCount
      },
      internships: internshipCount,
      applications: applicationCount,
      testimonialsApproved: approvedTestimonials,
      contactMessages: contactMessageCount,
      blogPosts: blogCount,
      faqEntries: faqCount,
      usersByCountry,
      applicationsByCountry,
      recent: range ? {
        applications: recentApplications.map(a => ({
          id: a._id,
          applicant: a.applicant,
          internshipTitle: a.internship?.translations?.fr?.title || '',
          createdAt: a.createdAt
        })),
        contactMessages: recentMessages,
        blogPosts: recentBlogPosts
      } : undefined
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
