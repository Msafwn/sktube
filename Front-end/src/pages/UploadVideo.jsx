import React, { useReducer, useCallback } from 'react';
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
// 1. INITIAL STATE & REDUCER DEFINITION
// ==========================================
const initialUploadState = {
  title: '',
  description: '',
  category: 'tech',
  visibility: 'public',
  videoFile: null,
  thumbnail: null,
  thumbnailPreview: null,
  loading: false,
  uploadProgress: 0,
  message: null,
  fieldErrors: {}
};

function uploadReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        fieldErrors: {
          ...state.fieldErrors,
          [action.field]: action.error !== undefined ? action.error : state.fieldErrors[action.field]
        },
        message: state.message?.type === 'error' ? null : state.message
      };

    case 'SET_FIELD_ERROR':
      return {
        ...state,
        fieldErrors: {
          ...state.fieldErrors,
          [action.field]: action.error
        }
      };

    case 'SET_MULTIPLE_ERRORS':
      return {
        ...state,
        fieldErrors: {
          ...state.fieldErrors,
          ...action.errors
        }
      };

    case 'SET_VIDEO_FILE':
      return {
        ...state,
        videoFile: action.file,
        fieldErrors: {
          ...state.fieldErrors,
          videoFile: ''
        },
        message: state.message?.type === 'error' ? null : state.message
      };

    case 'REMOVE_VIDEO_FILE':
      return {
        ...state,
        videoFile: null
      };

    case 'SET_THUMBNAIL':
      return {
        ...state,
        thumbnail: action.file,
        thumbnailPreview: action.preview,
        fieldErrors: {
          ...state.fieldErrors,
          thumbnail: ''
        },
        message: state.message?.type === 'error' ? null : state.message
      };

    case 'REMOVE_THUMBNAIL':
      return {
        ...state,
        thumbnail: null,
        thumbnailPreview: null
      };

    case 'SET_MESSAGE':
      return {
        ...state,
        message: action.message
      };

    case 'START_UPLOAD':
      return {
        ...state,
        loading: true,
        uploadProgress: 0,
        message: null
      };

    case 'SET_PROGRESS':
      return {
        ...state,
        uploadProgress: action.progress
      };

    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loading: false,
        uploadProgress: 100,
        message: {
          type: 'success',
          text: action.text || 'Video published successfully!'
        },
        title: '',
        description: '',
        videoFile: null,
        thumbnail: null,
        thumbnailPreview: null,
        fieldErrors: {}
      };

    case 'UPLOAD_ERROR':
      return {
        ...state,
        loading: false,
        uploadProgress: 0,
        message: {
          type: 'error',
          text: action.text
        }
      };

    default:
      return state;
  }
}

// ==========================================
// 2. MAIN COMPOUND ROOT COMPONENT: UploadVideo
// ==========================================
const UploadVideo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Central useReducer managing all form, media and upload states
  const [state, dispatch] = useReducer(uploadReducer, initialUploadState);
  const {
    title,
    description,
    category,
    visibility,
    videoFile,
    thumbnail,
    thumbnailPreview,
    loading,
    uploadProgress,
    message,
    fieldErrors
  } = state;

  const setCategory = useCallback((val) => {
    dispatch({ type: 'SET_FIELD', field: 'category', value: val });
  }, []);

  const setVisibility = useCallback((val) => {
    dispatch({ type: 'SET_FIELD', field: 'visibility', value: val });
  }, []);

  const handleCloseMessage = useCallback(() => {
    dispatch({ type: 'SET_MESSAGE', message: null });
  }, []);

  const handleTitleChange = useCallback((e) => {
    const val = e.target.value;
    let error = '';
    if (!val.trim()) error = 'Title is required';
    else if (val.trim().length < 3) error = 'Min 3 characters';
    dispatch({ type: 'SET_FIELD', field: 'title', value: val, error });
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    const val = e.target.value;
    const error = !val.trim() ? 'Description is required' : '';
    dispatch({ type: 'SET_FIELD', field: 'description', value: val, error });
  }, []);

  const handleVideoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        dispatch({
          type: 'SET_FIELD_ERROR',
          field: 'videoFile',
          error: 'Must be a valid video file (.mp4, .mov, etc.)'
        });
        return;
      }
      // Check 100MB Cloudinary limit
      if (file.size > 100 * 1024 * 1024) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        dispatch({
          type: 'SET_FIELD_ERROR',
          field: 'videoFile',
          error: `File is ${sizeMB}MB. Max allowed is 100MB.`
        });
        dispatch({
          type: 'SET_MESSAGE',
          message: {
            type: 'error',
            text: `Video file (${sizeMB}MB) exceeds Cloudinary's 100MB limit. Please select a video under 100MB.`
          }
        });
        return;
      }
      dispatch({ type: 'SET_VIDEO_FILE', file });
    }
  }, []);

  const handleThumbnailChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        dispatch({
          type: 'SET_FIELD_ERROR',
          field: 'thumbnail',
          error: 'Must be an image file (.jpg, .png, .webp)'
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        dispatch({
          type: 'SET_FIELD_ERROR',
          field: 'thumbnail',
          error: 'Image size must be under 5MB'
        });
        return;
      }
      const preview = URL.createObjectURL(file);
      dispatch({ type: 'SET_THUMBNAIL', file, preview });
    }
  }, []);

  const handleRemoveVideo = useCallback(() => {
    dispatch({ type: 'REMOVE_VIDEO_FILE' });
  }, []);

  const handleRemoveThumbnail = useCallback(() => {
    dispatch({ type: 'REMOVE_THUMBNAIL' });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (loading) return;

    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!videoFile) errors.videoFile = 'Please select a video file';
    if (!thumbnail) errors.thumbnail = 'Please select a thumbnail image';

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_MULTIPLE_ERRORS', errors });
      dispatch({
        type: 'SET_MESSAGE',
        message: { type: 'error', text: 'Please fill all required fields and choose your media files.' }
      });
      return;
    }

    try {
      dispatch({ type: 'START_UPLOAD' });

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
          dispatch({ type: 'SET_PROGRESS', progress: percentCompleted });
        }
      });

      dispatch({
        type: 'UPLOAD_SUCCESS',
        text: 'Video published successfully to Sktube! Redirecting to your video...'
      });

      // Navigate to newly published video after 1.5s
      const newVideoId = res?.data?._id;
      if (newVideoId) {
        setTimeout(() => {
          navigate(`/watch?v=${newVideoId}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Upload error:', err);
      dispatch({
        type: 'UPLOAD_ERROR',
        text: err.response?.data?.message || err.message || 'Error uploading video. Please login first or verify file format.'
      });
    }
  }, [loading, title, description, videoFile, thumbnail, category, visibility, navigate]);

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
        onCloseMessage={handleCloseMessage}
        fieldErrors={fieldErrors}
      />

      {/* 🖥️ Desktop / 4K Layout */}
      <div className="hidden md:flex flex-col gap-6 min-h-[calc(100vh-6rem)]">
        <UploadHeader />
        <UploadAlert message={message} onClose={handleCloseMessage} />

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
