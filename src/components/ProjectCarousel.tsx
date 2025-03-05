import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ProjectCard from './ProjectCard';
import { projectsData } from '../data/projects';

const ProjectCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleProjects, setVisibleProjects] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Gestion responsive avec paliers
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleProjects(1); // Mobile étroit (ex. < iPhone 12)
      } else if (width < 1024) {
        setVisibleProjects(2); // Tablette ou mobile large (ex. iPad)
      } else {
        setVisibleProjects(3); // Desktop (ex. 1080p+)
      }
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

  const next = useCallback(() => {
    setCurrentIndex(prevIndex =>
      prevIndex < projectsData.length - visibleProjects ? prevIndex + 1 : 0
    );
  }, [visibleProjects]);

  const prev = useCallback(() => {
    setCurrentIndex(prevIndex =>
      prevIndex > 0 ? prevIndex - 1 : projectsData.length - visibleProjects
    );
  }, [visibleProjects]);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(next, 7000);
    return () => clearInterval(interval);
  }, [next]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Gestion du glissement
  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragOffset(0);
    if (carouselRef.current) {
      carouselRef.current.style.transition = 'none';
    }
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging || !carouselRef.current) return;
    const offset = clientX - startX;
    setDragOffset(offset);
  }, [isDragging, startX]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !carouselRef.current) return;
    setIsDragging(false);
    carouselRef.current.style.transition = 'transform 0.6s ease-in-out';

    const threshold = 100; // Seuil pour changer de slide
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset < 0) next();
      else prev();
    }
    setDragOffset(0);
  }, [isDragging, dragOffset, next, prev]);

  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => handleDragEnd();
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  const transformValue = `translateX(calc(-${currentIndex * (100 / visibleProjects)}% + ${dragOffset}px))`;

  const carouselItems = useMemo(() => 
    projectsData.map(project => (
      <div key={project.id} className="carousel-item">
        <ProjectCard
          id={project.id}
          title={project.title}
          tags={project.tags}
          description={project.description}
          link={project.link}
        />
      </div>
    )),
    []
  );

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
            disabled={isDragging}
          >
            ❮
          </button>
          
          <div 
            className="carousel-content-wrapper"
            ref={wrapperRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div 
              ref={carouselRef}
              className="carousel-content"
              style={{ transform: transformValue }}
            >
              {carouselItems}
            </div>
          </div>
          
          <button 
            className="carousel-button carousel-button-next" 
            onClick={next}
            aria-label="Next projects"
            disabled={isDragging}
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
              disabled={isDragging}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectCarousel;