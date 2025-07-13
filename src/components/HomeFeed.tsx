import { useState } from 'react';
import PostCard from './PostCard';
import Stories from './Stories';

interface Comment {
  id: number;
  username: string;
  text: string;
}

interface Post {
  id: number;
  username: string;
  userAvatar: string;
  timestamp: string;
  image?: string;       // single image for posts 1-3
  images?: string[];    // multiple images for carousel posts 4-8
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  staticComments: Comment[];
}

const HomeFeed = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: 'Now',
      image: 'public/socialhive.png',
      caption: '🐝 Crafting Buzz. Driving Growth. Your partner in digital success.',
      likes: 1200,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'user1', text: 'Love the new branding! 🔥' },
        { id: 2, username: 'user2', text: 'So inspiring 🐝💛' },
      ],
    },
    {
      id: 2,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '1h',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
      caption: 'About Us: We create digital experiences that resonate and convert.',
      likes: 850,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'client1', text: 'Amazing team and vision! 👏' },
        { id: 2, username: 'client2', text: 'Highly recommend Social Hive! ⭐️' },
      ],
    },
    {
      id: 3,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '2h',
      image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80',
      caption: 'Why Social Hive? Because your brand deserves the buzz.',
      likes: 950,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'marketer', text: 'Their strategy works wonders! 💡' },
        { id: 2, username: 'fan123', text: 'I saw amazing results. 🚀' },
      ],
    },
    // Post 4 with carousel images for Services
    {
      id: 4,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '3h',
      images: [
        'https://images.unsplash.com/photo-1532619675605-64c5a00d9603?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
      ],
      caption: 'Our Services: Swipe to explore what we offer.',
      likes: 780,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'businessOwner', text: 'Great range of services. 👌' },
        { id: 2, username: 'entrepreneur', text: 'Helped my brand grow fast! 🙌' },
      ],
    },
    // Post 5 with carousel images for Founders & Managers
    {
      id: 5,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '4h',
      images: [
        'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
      ],
      caption: 'Founders & Managers: The visionaries behind Social Hive.',
      likes: 670,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'teamMember', text: 'Proud to be part of this team! 💼' },
        { id: 2, username: 'clientX', text: 'Such leadership inspires confidence. 🙏' },
      ],
    },
    // Post 6 with carousel images for Content Creators
    {
      id: 6,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '5h',
      images: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80',
      ],
      caption: 'Content Creators: Creativity fuels our campaigns.',
      likes: 720,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'creatorFan', text: 'Your content always amazes me. 🎨' },
        { id: 2, username: 'socialGuru', text: 'Talented team indeed! 💯' },
      ],
    },
    // Post 7 with carousel images for Producers
    {
      id: 7,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '6h',
      images: [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      ],
      caption: 'Producers: Bringing ideas to life with precision.',
      likes: 690,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'videoPro', text: 'Top-notch production quality! 🎥' },
        { id: 2, username: 'happyClient', text: 'Professional and timely delivery. 👍' },
      ],
    },
    // Post 8 with carousel images for Graphic Designers
    {
      id: 8,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '7h',
      images: [
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      ],
      caption: 'Graphic Designers: Crafting visual magic for your brand.',
      likes: 730,
      comments: 2,
      isLiked: false,
      staticComments: [
        { id: 1, username: 'designerLover', text: 'Love the aesthetics here! 🎨' },
        { id: 2, username: 'artFan', text: 'The designs are always fresh. 🖌️' },
      ],
    },
  ]);


  const handleLike = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
        : post
    ));
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Stories Section */}
      <Stories />

      {/* Posts Feed */}
      <div className="space-y-0">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeFeed;


// import { useState, useEffect } from 'react';
// import PostCard from './PostCard';
// import Stories from './Stories';

// const HomeFeed = () => {
//   const [posts, setPosts] = useState([
//     {
//       id: 1,
//       username: 'socialhive.agency',
//       userAvatar: '/lovable-uploads/social-hive-logo.png',
//       timestamp: '2h',
//       image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
//       caption: '🐝 Crafting digital experiences that create buzz! Our latest campaign for a beauty brand generated 2M+ impressions in just 30 days. #DigitalMarketing #SocialHive',
//       likes: 1247,
//       comments: 89,
//       isLiked: false
//     },
//     {
//       id: 6,
//       username: 'socialhive.agency',
//       userAvatar: '/lovable-uploads/social-hive-logo.png',
//       timestamp: '8h',
//       image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
//       caption: '✨ Meet our creative team! These amazing minds work tirelessly to bring your brand vision to life. From strategy to execution, we make magic happen. #TeamSocialHive #CreativeTeam',
//       likes: 892,
//       comments: 45,
//       isLiked: true
//     },
//     {
//       id: 7,
//       username: 'socialhive.agency',
//       userAvatar: '/lovable-uploads/social-hive-logo.png',
//       timestamp: '10h',
//       image: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23',
//       caption: '🚀 Results that speak louder than words! Our recent restaurant client saw a 300% increase in online orders after our 3-month campaign. Ready to grow your business? #Results #RestaurantMarketing',
//       likes: 2156,
//       comments: 134,
//       isLiked: false
//     },
//     {
//       id: 8,
//       username: 'socialhive.agency',
//       userAvatar: '/lovable-uploads/social-hive-logo.png',
//       timestamp: '12h',
//       image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
//       caption: '💡 Behind the scenes: Our data-driven approach to social media marketing. Every post, every campaign is backed by analytics and insights. #DataDriven #SocialMediaStrategy',
//       likes: 743,
//       comments: 67,
//       isLiked: true
//     },
//     {
//       id: 9,
//       username: 'socialhive.agency',
//       userAvatar: '/lovable-uploads/social-hive-logo.png',
//       timestamp: '14h',
//       image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
//       caption: '🎯 Targeting the right audience is everything! Our precision marketing strategies ensure your message reaches exactly who needs to hear it. #TargetedMarketing #Precision',
//       likes: 1089,
//       comments: 78,
//       isLiked: false
//     },
//     {
//       id: 2,
//       username: 'sarah.johnson',
//       userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
//       timestamp: '3h',
//       image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
//       caption: '👋 Meet Sarah Johnson, our Creative Director! With 8+ years in digital design, Sarah leads our creative vision and ensures every project tells a compelling story. When she\'s not designing, you\'ll find her exploring art galleries or hiking with her golden retriever. #MeetTheTeam #CreativeDirector',
//       likes: 892,
//       comments: 45,
//       isLiked: true
//     },
//     {
//       id: 3,
//       username: 'mike.rodriguez',
//       userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
//       timestamp: '4h',
//       image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
//       caption: '🚀 Say hello to Mike Rodriguez, our Head of Strategy! Mike turns complex data into actionable insights that drive real results. With a background in analytics and consumer psychology, he\'s the brain behind our most successful campaigns. Coffee enthusiast ☕ #MeetTheTeam #Strategy',
//       likes: 1156,
//       comments: 78,
//       isLiked: false
//     },
//     {
//       id: 4,
//       username: 'emma.chen',
//       userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
//       timestamp: '5h',
//       image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
//       caption: '💻 Meet Emma Chen, our Lead Developer! Emma brings our digital visions to life with clean, efficient code. Specializing in React and modern web technologies, she ensures our clients\' websites are fast, beautiful, and user-friendly. Tech geek by day, gamer by night 🎮 #MeetTheTeam #Developer',
//       likes: 743,
//       comments: 52,
//       isLiked: true
//     },
//     {
//       id: 5,
//       username: 'alex.turner',
//       userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
//       timestamp: '6h',
//       image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
//       caption: '📊 Meet Alex Turner, our Social Media Manager! Alex keeps our clients\' social presence buzzing with engaging content and community management. With a keen eye for trends and genuine passion for storytelling, he turns followers into loyal brand advocates. Marathon runner 🏃‍♂️ #MeetTheTeam #SocialMedia',
//       likes: 987,
//       comments: 67,
//       isLiked: false
//     }
//   ]);

//   const handleLike = (postId: number) => {
//     setPosts(posts.map(post => 
//       post.id === postId 
//         ? { 
//             ...post, 
//             isLiked: !post.isLiked,
//             likes: post.isLiked ? post.likes - 1 : post.likes + 1
//           }
//         : post
//     ));
//   };

//   return (
//     <div className="max-w-md mx-auto">
//       {/* Stories Section */}
//       <Stories />

//       {/* Posts Feed */}
//       <div className="space-y-0">
//         {posts.map(post => (
//           <PostCard
//             key={post.id}
//             post={post}
//             onLike={() => handleLike(post.id)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default HomeFeed;
