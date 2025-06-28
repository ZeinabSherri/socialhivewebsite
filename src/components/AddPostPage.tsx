
import { useState } from 'react';
import { ArrowLeft, Camera, Image, Video } from 'lucide-react';

interface AddPostPageProps {
  onBack: () => void;
}

const AddPostPage = ({ onBack }: AddPostPageProps) => {
  const [selectedType, setSelectedType] = useState<'photo' | 'video' | 'story'>('photo');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tagPeople, setTagPeople] = useState('');

  const handleShare = () => {
    // Handle post sharing
    console.log('Sharing post...');
    onBack();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="text-white hover:opacity-70"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">New post</h1>
        <button
          onClick={handleShare}
          className="text-blue-400 font-semibold hover:text-blue-300"
        >
          Share
        </button>
      </header>

      {/* Content Selection Area */}
      <div className="aspect-square bg-gray-900 flex items-center justify-center border-b border-gray-800">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-400 mb-4">Select photos and videos</p>
          <div className="flex gap-4 justify-center">
            <button className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600">
              <Image size={20} />
              <span>Photo</span>
            </button>
            <button className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600">
              <Video size={20} />
              <span>Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Post Options */}
      <div className="p-4 space-y-4">
        {/* Caption */}
        <div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🐝</span>
            </div>
            <div className="flex-1">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                className="w-full bg-transparent text-white resize-none outline-none placeholder-gray-400 text-sm"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <span className="text-white">Add location</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search locations..."
            className="bg-transparent text-right text-gray-400 outline-none placeholder-gray-500 text-sm"
          />
        </div>

        {/* Tag People */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800">
          <span className="text-white">Tag people</span>
          <input
            type="text"
            value={tagPeople}
            onChange={(e) => setTagPeople(e.target.value)}
            placeholder="Search people..."
            className="bg-transparent text-right text-gray-400 outline-none placeholder-gray-500 text-sm"
          />
        </div>

        {/* Advanced Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3">
            <span className="text-white">Also post to Facebook</span>
            <div className="w-12 h-6 bg-gray-700 rounded-full p-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-white">Turn off commenting</span>
            <div className="w-12 h-6 bg-gray-700 rounded-full p-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-white">Hide like and view counts</span>
            <div className="w-12 h-6 bg-gray-700 rounded-full p-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div className="pt-4">
          <button className="text-blue-400 text-sm hover:text-blue-300">
            Advanced settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPostPage;
