export interface ProjectCardProps {
  id: string; 
  title: string;
  tags: string[];
  description: string;
  link?: string;
}

const ProjectCard = ({ title, tags, description, link }: ProjectCardProps) => {
  return (
    <div className={`project-card ${!link ? 'no-link' : ''}`}>
      <h3 className="project-title">{title}</h3>
      <div className="project-tags">
        {tags.map(tag => (
          <span key={tag} className="project-tag">{tag}</span>
        ))}
      </div>
      <p className="project-description">{description}</p>
      {link && (
        <a href={link} className="project-link" target="_blank" rel="noopener noreferrer">
          View Project →
        </a>
      )}
    </div>
  );
};

export default ProjectCard;
