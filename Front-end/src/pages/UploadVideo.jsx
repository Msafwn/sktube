import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  UploadHeader,
  UploadAlert,
  UploadFormFields,
  UploadMediaDropzone,
  UploadMobileForm
} from '../components/upload';
import videoService from '../services/videoService';

// ==========================================
// MAIN COMPOUND ROOT COMPONENT: UploadVideo
// ==========================================
const UploadVideo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('tech');
  const [visibility, setVisibility] = useState('public');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Field validator useCallback
  const validateField = useCallback((name, value) => {
    let error = '';
    switch (name) {
      case 'title':
        if (!value.trim()) error = 'Title is required';
        else if (value.trim().length < 3) error = 'Min 3 characters';
        break;
      case 'description':
        if (!value.trim()) error = 'Description is required';
        break;
      case 'videoFile':
        if (!value) error = 'Video file is required';
        break;
      case 'thumbnail':
        if (!value) error = 'Thumbnail is required';
        break;
      default:
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
    if (message?.type === 'error') setMessage(null);
    return !error;
  }, [message]);

  const handleTitleChange = useCallback((e) => {
    const val = e.target.value;
    setTitle(val);
    validateField('title', val);
  }, [validateField]);

  const handleDescriptionChange = useCallback((e) => {
    const val = e.target.value;
    setDescription(val);
    validateField('description', val);
  }, [validateField]);

  const handleVideoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setFieldErrors((prev) => ({ ...prev, videoFile: 'Must be a valid video file (.mp4, .mov, etc.)' }));
        return;
      }
      // Check 100MB Cloudinary limit
      if (file.size > 100 * 1024 * 1024) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setFieldErrors((prev) => ({ ...prev, videoFile: `File is ${sizeMB}MB. Max allowed is 100MB.` }));
        setMessage({
          type: 'error',
          text: `Video file (${sizeMB}MB) exceeds Cloudinary's 100MB limit. Please select a video under 100MB.`
        });
        return;
      }
      setVideoFile(file);
      setFieldErrors((prev) => ({ ...prev, videoFile: '' }));
      if (message?.type === 'error') setMessage(null);
    }
  }, [message]);

  const handleThumbnailChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFieldErrors((prev) => ({ ...prev, thumbnail: 'Must be an image file (.jpg, .png, .webp)' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, thumbnail: 'Image size must be under 5MB' }));
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setFieldErrors((prev) => ({ ...prev, thumbnail: '' }));
      if (message?.type === 'error') setMessage(null);
    }
  }, [message]);

  const handleRemoveVideo = useCallback(() => {
    setVideoFile(null);
  }, []);

  const handleRemoveThumbnail = useCallback(() => {
    setThumbnail(null);
    setThumbnailPreview(null);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!videoFile) errors.videoFile = 'Please select a video file';
    if (!thumbnail) errors.thumbnail = 'Please select a thumbnail image';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessage({ type: 'error', text: 'Please fill all required fields and choose your media files.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('isPublished', visibility === 'public');
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnail);

      const res = await videoService.publishVideo(formData, (progressEvent) => {
        if (progressEvent?.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setMessage({
        type: 'success',
        text: 'Video published successfully to Sktube! Redirecting to your video...'
      });

      // Clear Form
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnail(null);
      setThumbnailPreview(null);
      setFieldErrors({});

      // If video created successfully, navigate to watch page after 1.5 seconds
      const newVideoId = res?.data?._id;
      if (newVideoId) {
        setTimeout(() => {
          navigate(`/watch?v=${newVideoId}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Error uploading video. Please login first or verify file format.'
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [title, description, videoFile, thumbnail, category, visibility, navigate]);

  // If user is not logged in, prompt to login
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center container-4k p-4">
        <div className="max-w-md w-full glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 text-center flex flex-col items-center gap-4 shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF0055] via-[#FF2E7E] to-[#7928CA] flex items-center justify-center text-white shadow-xl shadow-[#FF0055]/30">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Sign In Required</h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
              Only authenticated creators can upload and publish 4K videos on Sktube. Please sign in to access your Creator Studio.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full mt-2">
            <Link
              to="/login"
              className="btn-primary flex-1 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white text-center shadow-lg shadow-[#FF0055]/30"
            >
              Sign In Now
            </Link>
            <Link
              to="/register"
              className="flex-1 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white text-center bg-white/5 hover:bg-white/10 border border-white/15 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative container-4k">
      {/* Background Ambient Glows */}
      <div className="ambient-glow top-0 right-1/4 w-[400px] lg:w-[600px] h-[350px] bg-[#FF0055]/10 rounded-full pointer-events-none"></div>
      <div className="ambient-glow bottom-10 left-10 w-[400px] lg:w-[600px] h-[350px] bg-[#7928CA]/10 rounded-full pointer-events-none"></div>

      {/* 📱 Mobile Layout */}
      <UploadMobileForm
        title={title}
        handleTitleChange={handleTitleChange}
        description={description}
        handleDescriptionChange={handleDescriptionChange}
        videoFile={videoFile}
        handleVideoChange={handleVideoChange}
        thumbnail={thumbnail}
        handleThumbnailChange={handleThumbnailChange}
        handleSubmit={handleSubmit}
        loading={loading}
        uploadProgress={uploadProgress}
        message={message}
        onCloseMessage={() => setMessage(null)}
        fieldErrors={fieldErrors}
      />

      {/* 🖥️ Desktop / 4K Layout */}
      <div className="hidden md:flex flex-col gap-6 min-h-[calc(100vh-6rem)]">
        <UploadHeader />
        <UploadAlert message={message} onClose={() => setMessage(null)} />

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6 relative z-10">
          <div className="col-span-12 md:col-span-7 flex flex-col gap-4">
            <UploadFormFields
              title={title}
              handleTitleChange={handleTitleChange}
              description={description}
              handleDescriptionChange={handleDescriptionChange}
              category={category}
              setCategory={setCategory}
              visibility={visibility}
              setVisibility={setVisibility}
              fieldErrors={fieldErrors}
            />
          </div>

          <UploadMediaDropzone
            videoFile={videoFile}
            handleVideoChange={handleVideoChange}
            handleRemoveVideo={handleRemoveVideo}
            thumbnail={thumbnail}
            thumbnailPreview={thumbnailPreview}
            handleThumbnailChange={handleThumbnailChange}
            handleRemoveThumbnail={handleRemoveThumbnail}
            loading={loading}
            uploadProgress={uploadProgress}
            fieldErrors={fieldErrors}
          />
        </form>
      </div>
    </div>
  );
};

// Compound attachments
UploadVideo.Header = UploadHeader;
UploadVideo.Alert = UploadAlert;
UploadVideo.FormFields = UploadFormFields;
UploadVideo.MediaDropzone = UploadMediaDropzone;
UploadVideo.MobileForm = UploadMobileForm;

export default UploadVideo;
