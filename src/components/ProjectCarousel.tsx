import { useState, useEffect, useRef, useCallback } from 'react';
import ProjectCard from './ProjectCard';
import { projectsData } from '../data/projects';

const ProjectCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  

  const [visibleProjects, setVisibleProjects] = useState(2);
  

  useEffect(() => {
    const handleResize = () => {
      setVisibleProjects(window.innerWidth < 768 ? 1 : 2);
    };
    
    
    handleResize();
    
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const next = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => 
      prevIndex < projectsData.length - visibleProjects ? prevIndex + 1 : 0
    );
  }, [isTransitioning, visibleProjects, projectsData.length]);
  
  const prev = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => 
      prevIndex > 0 ? prevIndex - 1 : projectsData.length - visibleProjects
    );
  }, [isTransitioning, visibleProjects, projectsData.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // Duration
    
    return () => clearTimeout(timer);
  }, [currentIndex]);
  
  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(next, 7000);
    return () => clearInterval(interval);
  }, [next]); 
  
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
  }, [isTransitioning]);
  
  const dotsCount = Math.max(1, projectsData.length - visibleProjects + 1);
  
  return (
    <section id="projects" className="section section-dark">
      <div className="section-content">
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-subtitle">Here are some of my recent works in the Web3 space.</p>
        
        <div className="carousel-container">
          <button 
            className="carousel-button carousel-button-prev" 
            onClick={prev}
            aria-label="Previous projects"
            disabled={isTransitioning}
          >
            &#10094;
          </button>
          
          <div className="carousel-content-wrapper">
            <div 
              ref={carouselRef}
              className="carousel-content"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / visibleProjects)}%)`,
              }}
            >
              {projectsData.map((project) => (
                <div 
                  key={project.id || `project-${project.title}`}
                  className="carousel-item"
                >
                  <ProjectCard
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
            aria-label="Next projects"
            disabled={isTransitioning}
          >
            &#10095;
          </button>
        </div>
        
        <div className="carousel-dots">
          {Array.from({ length: dotsCount }).map((_, index) => (
            <button
              key={`dot-${index}`}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to project set ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectCarousel;