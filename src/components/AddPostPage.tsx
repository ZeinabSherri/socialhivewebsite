
import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

interface AddPostPageProps {
  onBack: () => void;
}

const AddPostPage = ({ onBack }: AddPostPageProps) => {
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
    
    // Go back after success message
    setTimeout(() => {
      onBack();
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-black text-2xl">🐝</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
          <p className="text-gray-300 mb-4">
            Your project inquiry has been received. Our team will get back to you within 24 hours.
          </p>
          <div className="text-yellow-400 text-sm">Going back automatically...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black border-b border-gray-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-yellow-400">Social Hive</h1>
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-black text-sm">🐝</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">Start Your Project</h2>
          <p className="text-gray-300">Ready to create some buzz? Let's discuss your project!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Your Name"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Email Address"
            />
          </div>

          <div>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Business Name"
            />
          </div>

          <div>
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
            <textarea
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              placeholder="Tell us about your project..."
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
                <span>Send Message</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            By submitting this form, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AddPostPage;
