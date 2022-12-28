const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const allCampgrounds = await Campground.find({});
  res.render('campgrounds/index.ejs', {
      allCampgrounds
  });
}

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new.ejs');
}

module.exports.createCampground = async (req, res, next) => {
  const newCampground = new Campground(req.body.campground);
  newCampground.images = req.files.map(file => ({url: file.path, filename: file.filename}))
  newCampground.author = req.user._id;
  await newCampground.save();
  req.flash('success', 'Succesfully created a new Campground');
  res.redirect(`/campgrounds/${newCampground._id}`)
}

module.exports.showCampground = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id).populate({
    path: 'reviews',
    populate: {
      path: 'author'
    }
  }).populate('author');
  if (!campground) {
    req.flash('error', 'Cannot find that Campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show.ejs', {
    campground
  });
}

module.exports.renderEditForm = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash('error', 'Cannot find that Campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit.ejs', {
    campground
  });
}

module.exports.updateCampground = async (req, res) => {
  const {id} = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
  const imgs = req.files.map(file => ({url: file.path, filename: file.filename}));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
}
  req.flash('success', 'Succesfully updated Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.deleteCampground = async (req, res) => {
  const {id} = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash('success', 'Succesfully deleted Campground');
  res.redirect('/campgrounds');
}