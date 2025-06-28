
import { useState } from 'react';
import { X } from 'lucide-react';

const ExplorePage = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const projects = [
    {
      id: 1,
      title: 'Restaurant Chain Campaign',
      industry: 'Restaurants',
      type: 'Carousel',
      thumbnail: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23',
      description: 'Increased online orders by 300% for a local restaurant chain through targeted social media campaigns.',
      results: '300% increase in online orders, 2.5M reach, 15% engagement rate',
      client: 'Bella Vista Restaurants'
    },
    {
      id: 2,
      title: 'Beauty Brand Launch',
      industry: 'Beauty',
      type: 'Reel',
      thumbnail: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      description: 'Successfully launched a new beauty brand with viral content strategy.',
      results: '5M+ views, 25K new followers, 180% sales increase',
      client: 'Glow Beauty Co.'
    },
    {
      id: 3,
      title: 'Medical Clinic Growth',
      industry: 'Clinics',
      type: 'Carousel',
      thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      description: 'Helped a medical clinic establish trusted online presence and increase patient bookings.',
      results: '400% increase in online bookings, 95% positive reviews',
      client: 'HealthFirst Clinic'
    },
    {
      id: 4,
      title: 'E-commerce Success Story',
      industry: 'E-Commerce',
      type: 'Reel',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      description: 'Transformed an e-commerce store with data-driven marketing strategies.',
      results: '250% ROI, 1.8M impressions, 12% conversion rate',
      client: 'TechGadgets Pro'
    },
    {
      id: 5,
      title: 'Real Estate Portfolio',
      industry: 'Real Estate',
      type: 'Carousel',
      thumbnail: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625',
      description: 'Generated quality leads for luxury real estate properties through premium content.',
      results: '150 qualified leads, 85% lead quality score, $2M in sales',
      client: 'Luxury Estates Group'
    },
    {
      id: 6,
      title: 'Educational Platform Growth',
      industry: 'Education',
      type: 'Reel',
      thumbnail: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b',
      description: 'Boosted enrollment for online education platform with engaging video content.',
      results: '500% enrollment increase, 3.2M video views',
      client: 'LearnTech Academy'
    }
  ];

  const filters = ['All', 'Restaurants', 'Beauty', 'Clinics', 'E-Commerce', 'Real Estate', 'Education'];

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(project => project.industry === activeFilter);

  return (
    <div className="max-w-md mx-auto">
      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-gray-800">
        <input
          type="text"
          placeholder="Search projects, industries..."
          className="w-full bg-gray-900 text-white placeholder-gray-400 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex space-x-2 overflow-x-auto">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-3 gap-1 p-1">
        {filteredProjects.map(project => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="aspect-square bg-gray-900 cursor-pointer hover:opacity-80 transition-opacity relative group"
          >
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {project.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{selectedProject.title}</h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4">
              <img
                src={selectedProject.thumbnail}
                alt={selectedProject.title}
                className="w-full aspect-video object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-4">
                <div>
                  <span className="inline-block bg-yellow-400 text-black text-xs font-semibold px-2 py-1 rounded-full mb-2">
                    {selectedProject.industry}
                  </span>
                  <p className="text-gray-300 text-sm">{selectedProject.description}</p>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-2">Results</h4>
                  <p className="text-yellow-400 text-sm">{selectedProject.results}</p>
                </div>
                
                <div>
                  <h4 className="text-white font-semibold mb-2">Client</h4>
                  <p className="text-gray-300 text-sm">{selectedProject.client}</p>
                </div>
                
                <button className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-300 transition-colors">
                  Start Your Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
