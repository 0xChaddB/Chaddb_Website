import React from 'react';

interface ProjectCardProps {
  id: string;
  title: string;
  tags: string[];
  description: string;
  link?: string;
  ariaLabel?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, tags, description, link, ariaLabel }) => {
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
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link"
          aria-label={ariaLabel || `Voir le projet ${title}`}
        >
          View Project <span>→</span>
        </a>
      ) : (
        <span className="project-link-disabled" aria-label={ariaLabel || `${title} (no link available)`}>
          Coming Soon
        </span>
      )}
    </div>
  );
};

export default ProjectCard;