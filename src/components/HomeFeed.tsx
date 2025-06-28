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
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '4h',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      caption: '✨ Meet our creative team! These amazing minds work tirelessly to bring your brand vision to life. From strategy to execution, we make magic happen. #TeamSocialHive #CreativeTeam',
      likes: 892,
      comments: 45,
      isLiked: true
    },
    {
      id: 3,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '6h',
      image: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23',
      caption: '🚀 Results that speak louder than words! Our recent restaurant client saw a 300% increase in online orders after our 3-month campaign. Ready to grow your business? #Results #RestaurantMarketing',
      likes: 2156,
      comments: 134,
      isLiked: false
    },
    {
      id: 4,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '8h',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      caption: '💡 Behind the scenes: Our data-driven approach to social media marketing. Every post, every campaign is backed by analytics and insights. #DataDriven #SocialMediaStrategy',
      likes: 743,
      comments: 67,
      isLiked: true
    },
    {
      id: 5,
      username: 'socialhive.agency',
      userAvatar: '/lovable-uploads/social-hive-logo.png',
      timestamp: '12h',
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
