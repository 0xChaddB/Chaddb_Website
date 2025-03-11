import React from 'react';

interface ProjectCardProps {
  id: string;
  title: string;
  tags: string[];
  description: string;
  link?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, tags, description, link }) => {
  return (
    <div className="project-card">
      <h3 className="project-title">{title}</h3>
      <div className="project-tags">
        {tags.map((tag, index) => (
          <span key={index} className="project-tag">{tag}</span>
        ))}
      </div>
      <p className="project-description">{description}</p>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="project-link">
          View Project <span>→</span>
        </a>
      ) : (
        <span className="project-link-disabled">Coming Soon</span>
      )}
    </div>
  );
};

export default ProjectCard;