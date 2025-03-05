import { useState, useEffect, useRef, useCallback } from 'react';
import ProjectCard from './ProjectCard';
import { projectsData } from '../data/projects';

const ProjectCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleProjects, setVisibleProjects] = useState(2);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Gestion responsive avec paliers
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

  // Synchronisation de l’index avec le défilement
  useEffect(() => {
    const handleScroll = () => {
      if (!carouselRef.current) return;
      const scrollLeft = carouselRef.current.scrollLeft;
      const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setCurrentIndex(newIndex);
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const next = useCallback(() => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    const newScrollLeft = (currentIndex + 1) * itemWidth;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }, [currentIndex]);

  const prev = useCallback(() => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    const newScrollLeft = (currentIndex - 1) * itemWidth;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }, [currentIndex]);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(next, 7000);
    return () => clearInterval(interval);
  }, [next]);

  const goToSlide = useCallback((index: number) => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    const newScrollLeft = index * itemWidth;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }, []);

  const dotsCount = Math.max(1, projectsData.length - visibleProjects + 1);

  return (
    <section id="projects" className="section section-dark" role="region" aria-label="Featured Projects Carousel">
      <div className="section-content">
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-subtitle">Here are some of my recent works in the Web3 space.</p>
        
        <div className="carousel-container">
          <button 
            className="carousel-button carousel-button-prev" 
            onClick={prev}
            aria-label="Previous projects"
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
            aria-label="Next projects"
          >
            ❯
          </button>
        </div>
        
        <div className="carousel-dots">
          {Array.from({ length: dotsCount }).map((_, index) => (
            <button
              key={`dot-${index}`}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to project set ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectCarousel;