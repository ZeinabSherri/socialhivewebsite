
import { useState } from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';

interface AddPostPageProps {
  onBack: () => void;
}

const AddPostPage = ({ onBack }: AddPostPageProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Handle form submission
    onBack();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-yellow-400 mb-2">Social Hive</h1>
        <p className="text-gray-400 text-sm">Crafting Buzz. Driving Growth. 🐝</p>
      </div>

      {/* Start Your Project Section */}
      <div className="px-4 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-yellow-400 mb-2">Start Your Project</h2>
          <p className="text-gray-400 text-sm">Ready to create some buzz? Let's discuss your project!</p>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          {/* Name Field */}
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your Name"
              className="w-full bg-gray-800 border-none rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="w-full bg-gray-800 border-none rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {/* Business Name Field */}
          <div>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Business Name"
              className="w-full bg-gray-800 border-none rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Project Details Field */}
          <div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us about your project..."
              rows={4}
              className="w-full bg-gray-800 border-none rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              required
            />
            {formData.message.trim() === '' && (
              <div className="mt-2 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                Please fill out this field.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-yellow-400 text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <MessageSquare size={20} />
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostPage;
