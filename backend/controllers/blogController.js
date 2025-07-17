const BlogPost = require('../models/BlogPost');


exports.createBlogPost = async (req, res) => {
  const { slug, translations, imageUrl, publishedAt } = req.body;
  const author = req.user;

  if (
    !slug || !translations?.fr || !translations?.en ||
    !translations.fr.title || !translations.fr.content ||
    !translations.en.title || !translations.en.content ||
    !publishedAt
  ) {
    return res.status(400).json({ message: 'Champs requis manquants ou invalides.' });
  }

  try {
    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Un article avec ce slug existe déjà.' });
    }

    const post = new BlogPost({
      slug,
      translations,
      imageUrl,
      publishedAt,
      author: author._id
    });

    await post.save();
    res.status(201).json({ message: 'Article créé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🔓 Liste des articles (triés du plus récent au plus ancien)
exports.getAllBlogPosts = async (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

  try {
    const posts = await BlogPost.find()
      .sort({ publishedAt: -1 })
      .select(`slug imageUrl publishedAt translations.${lang}.title translations.${lang}.summary`);

    const formatted = posts.map(post => ({
      slug: post.slug,
      imageUrl: post.imageUrl,
      publishedAt: post.publishedAt,
      title: post.translations[lang].title,
      summary: post.translations[lang].summary
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🔓 Un article spécifique par slug
exports.getBlogPostBySlug = async (req, res) => {
  const { slug } = req.params;
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'fr';

  try {
    const post = await BlogPost.findOne({ slug });

    if (!post) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    res.status(200).json({
      slug: post.slug,
      imageUrl: post.imageUrl,
      publishedAt: post.publishedAt,
      ...post.translations[lang]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getAllBlogPostsAdmin = async (req, res) => {
  const { lang, authorId, fromDate, toDate, page = 1, limit = 10 } = req.query;

  const filter = {};

  if (authorId) filter.author = authorId;

  if (fromDate || toDate) {
    filter.publishedAt = {};
    if (fromDate) filter.publishedAt.$gte = new Date(fromDate);
    if (toDate) filter.publishedAt.$lte = new Date(toDate);
  }

  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  try {
    const total = await BlogPost.countDocuments(filter);

    const posts = await BlogPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('author', 'firstName lastName email');

    const data = posts.map(post => ({
      slug: post.slug,
      imageUrl: post.imageUrl,
      publishedAt: post.publishedAt,
      author: {
        id: post.author._id,
        name: `${post.author.firstName} ${post.author.lastName}`,
        email: post.author.email
      },
      translations: lang ? { [lang]: post.translations[lang] } : post.translations,
      createdAt: post.createdAt
    }));

    res.status(200).json({
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};




exports.updateBlogPost = async (req, res) => {
  const { slug } = req.params;
  const { translations, imageUrl, publishedAt } = req.body;

  try {
    const post = await BlogPost.findOne({ slug });
    if (!post) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    if (translations?.fr && translations?.en) {
      post.translations = translations;
    }

    if (imageUrl) post.imageUrl = imageUrl;
    if (publishedAt) post.publishedAt = publishedAt;

    await post.save();
    res.status(200).json({ message: 'Article mis à jour avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.deleteBlogPost = async (req, res) => {
  try {
    const deleted = await BlogPost.findOneAndDelete({ slug: req.params.slug });

    if (!deleted) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    res.status(200).json({ message: 'Article supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
