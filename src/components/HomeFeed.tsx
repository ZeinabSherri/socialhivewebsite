
import { useState, useEffect } from 'react';
import PostCard from './PostCard';
import Stories from './Stories';

const HomeFeed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '2h',
      image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
      caption: '🐝 Crafting digital experiences that create buzz! Our latest campaign for a beauty brand generated 2M+ impressions in just 30 days. #DigitalMarketing #SocialHive',
      likes: 1247,
      comments: 89,
      isLiked: false
    },
    {
      id: 2,
      username: 'sarah.johnson',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      timestamp: '3h',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      caption: '👋 Meet Sarah Johnson, our Creative Director! With 8+ years in digital design, Sarah leads our creative vision and ensures every project tells a compelling story. When she\'s not designing, you\'ll find her exploring art galleries or hiking with her golden retriever. #MeetTheTeam #CreativeDirector',
      likes: 892,
      comments: 45,
      isLiked: true
    },
    {
      id: 3,
      username: 'mike.rodriguez',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      timestamp: '4h',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      caption: '🚀 Say hello to Mike Rodriguez, our Head of Strategy! Mike turns complex data into actionable insights that drive real results. With a background in analytics and consumer psychology, he\'s the brain behind our most successful campaigns. Coffee enthusiast ☕ #MeetTheTeam #Strategy',
      likes: 1156,
      comments: 78,
      isLiked: false
    },
    {
      id: 4,
      username: 'emma.chen',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      timestamp: '5h',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      caption: '💻 Meet Emma Chen, our Lead Developer! Emma brings our digital visions to life with clean, efficient code. Specializing in React and modern web technologies, she ensures our clients\' websites are fast, beautiful, and user-friendly. Tech geek by day, gamer by night 🎮 #MeetTheTeam #Developer',
      likes: 743,
      comments: 52,
      isLiked: true
    },
    {
      id: 5,
      username: 'alex.turner',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      timestamp: '6h',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      caption: '📊 Meet Alex Turner, our Social Media Manager! Alex keeps our clients\' social presence buzzing with engaging content and community management. With a keen eye for trends and genuine passion for storytelling, he turns followers into loyal brand advocates. Marathon runner 🏃‍♂️ #MeetTheTeam #SocialMedia',
      likes: 987,
      comments: 67,
      isLiked: false
    },
    {
      id: 6,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '8h',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      caption: '✨ Meet our creative team! These amazing minds work tirelessly to bring your brand vision to life. From strategy to execution, we make magic happen. #TeamSocialHive #CreativeTeam',
      likes: 892,
      comments: 45,
      isLiked: true
    },
    {
      id: 7,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '10h',
      image: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23',
      caption: '🚀 Results that speak louder than words! Our recent restaurant client saw a 300% increase in online orders after our 3-month campaign. Ready to grow your business? #Results #RestaurantMarketing',
      likes: 2156,
      comments: 134,
      isLiked: false
    },
    {
      id: 8,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '12h',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      caption: '💡 Behind the scenes: Our data-driven approach to social media marketing. Every post, every campaign is backed by analytics and insights. #DataDriven #SocialMediaStrategy',
      likes: 743,
      comments: 67,
      isLiked: true
    },
    {
      id: 9,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '14h',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      caption: '🎯 Targeting the right audience is everything! Our precision marketing strategies ensure your message reaches exactly who needs to hear it. #TargetedMarketing #Precision',
      likes: 1089,
      comments: 78,
      isLiked: false
    }
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
