
import { useState } from 'react';
import { X, Send } from 'lucide-react';

interface AddPostModalProps {
  onClose: () => void;
}

const AddPostModal = ({ onClose }: AddPostModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: '',
    budget: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    'Social Media Management',
    'Content Creation',
    'Paid Advertising',
    'Brand Strategy',
    'Influencer Marketing',
    'Analytics & Reporting'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Close modal after success message
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black text-2xl">🐝</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
          <p className="text-gray-300 mb-4">
            Your project inquiry has been received. Our team will get back to you within 24 hours.
          </p>
          <div className="text-yellow-400 text-sm">Closing automatically...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Start Your Project</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Your company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service Interested In *
            </label>
            <select
              name="service"
              required
              value={formData.service}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select a service</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Budget
            </label>
            <select
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select budget range</option>
              <option value="$1,000 - $5,000">$1,000 - $5,000</option>
              <option value="$5,000 - $10,000">$5,000 - $10,000</option>
              <option value="$10,000 - $25,000">$10,000 - $25,000</option>
              <option value="$25,000+">$25,000+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Details *
            </label>
            <textarea
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              placeholder="Tell us about your project goals, timeline, and any specific requirements..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Send Inquiry</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            By submitting this form, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AddPostModal;
