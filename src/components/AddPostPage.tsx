
import { useState } from 'react';
import { ArrowLeft, Mail, Phone, MessageSquare } from 'lucide-react';

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
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="text-white hover:opacity-70"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Contact Us</h1>
        <button
          onClick={handleSubmit}
          className="text-blue-400 font-semibold hover:text-blue-300"
        >
          Send
        </button>
      </header>

      {/* Contact Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-black text-2xl">🐝</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Get in Touch</h2>
            <p className="text-gray-400 text-sm">We'd love to hear from you. Send us a message!</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-white text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-white text-sm font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="What is this about?"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                required
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-white text-sm font-medium mb-2">
                Message
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-4 text-gray-400" size={20} />
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-yellow-400 text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-500 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              Send Message
            </button>
          </div>

          {/* Contact Info */}
          <div className="pt-6 border-t border-gray-800">
            <h3 className="text-white font-medium mb-4">Other ways to reach us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail size={16} />
                <span className="text-sm">support@socialhive.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone size={16} />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostPage;
