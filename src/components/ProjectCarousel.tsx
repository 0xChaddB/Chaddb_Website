import { useState, useEffect, useRef } from 'react';
import ProjectCard from './ProjectCard';
import { projectsData } from '../data/projects';

const ProjectCarousel = () => {
  const [currentGroup, setCurrentGroup] = useState(0);
  const [visibleProjects, setVisibleProjects] = useState(2);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Gestion responsive
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleProjects(1);
      else if (width < 1024) setVisibleProjects(2);
      else setVisibleProjects(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Synchronisation CSS
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.setProperty('--visible-projects', visibleProjects.toString());
    }
  }, [visibleProjects]);

  const totalGroups = Math.ceil(projectsData.length / visibleProjects) || 1;

  const next = () => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    const newGroup = Math.min(currentGroup + 1, totalGroups - 1);
    const newScrollLeft = newGroup * visibleProjects * itemWidth;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    setCurrentGroup(newGroup);
  };

  const prev = () => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    const newGroup = Math.max(currentGroup - 1, 0);
    const newScrollLeft = newGroup * visibleProjects * itemWidth;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    setCurrentGroup(newGroup);
  };

  return (
    <section id="projects" className="section section-dark">
      <div className="section-content">
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-subtitle">Here are some of my recent works in the Web3 space.</p>
        <div className="carousel-container">
          <button
            className="carousel-button carousel-button-prev"
            onClick={prev}
            disabled={currentGroup === 0}
            aria-label="Previous project group"
          >
            ❮
          </button>
          <div className="carousel-content-wrapper">
            <div ref={carouselRef} className="carousel-content">
              {projectsData.map(project => (
                <div key={project.id} className="carousel-item">
                  <ProjectCard
                    id={project.id}
                    title={project.title}
                    tags={project.tags}
                    description={project.description}
                    link={project.link}
                  />
                </div>
              ))}
            </div>
          </div>
          <button
            className="carousel-button carousel-button-next"
            onClick={next}
            disabled={currentGroup === totalGroups - 1}
            aria-label="Next project group"
          >
            ❯
          </button>
        </div>
        <div className="carousel-dots">
          {Array.from({ length: totalGroups }).map((_, index) => (
            <button
              key={`dot-${index}`}
              className={`carousel-dot ${index === currentGroup ? 'active' : ''}`}
              onClick={() => {
                if (!carouselRef.current) return;
                const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
                const newScrollLeft = index * visibleProjects * itemWidth;
                carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
                setCurrentGroup(index);
              }}
              aria-label={`Go to project group ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectCarousel;