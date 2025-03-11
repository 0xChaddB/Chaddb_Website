import { useState, useEffect, useRef, useCallback } from 'react';
import ProjectCard from './ProjectCard';
import { projectsData } from '../data/projects';

const ProjectCarousel = () => {
  const [currentGroup, setCurrentGroup] = useState(0);
  const [visibleProjects, setVisibleProjects] = useState(2);
  const carouselRef = useRef<HTMLDivElement>(null);

  //  responsive
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

  // grp number calcul
  const totalGroups = Math.ceil(projectsData.length / visibleProjects) || 1;

  // next
  const next = useCallback(() => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    const newGroup = Math.min(currentGroup + 1, totalGroups - 1);
    const newScrollLeft = newGroup * visibleProjects * itemWidth;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    setCurrentGroup(newGroup);
  }, [currentGroup, visibleProjects, totalGroups]);

  // previous
  const prev = useCallback(() => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    const newGroup = Math.max(currentGroup - 1, 0);
    const newScrollLeft = newGroup * visibleProjects * itemWidth;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    setCurrentGroup(newGroup);
  }, [currentGroup, visibleProjects]);

  // Index synchro
  useEffect(() => {
    const handleScroll = () => {
      if (!carouselRef.current) return;
      const scrollLeft = carouselRef.current.scrollLeft;
      const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
      const newGroup = Math.round(scrollLeft / (itemWidth * visibleProjects));
      setCurrentGroup(newGroup);
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, [visibleProjects]);

  // dot group
  const goToGroup = useCallback((groupIndex: number) => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    const newScrollLeft = groupIndex * visibleProjects * itemWidth;
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    setCurrentGroup(groupIndex);
  }, [visibleProjects]);

  // keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent, action: 'prev' | 'next') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (action === 'prev') prev();
      else next();
    }
  };

  return (
    <section id="projects" className="section section-dark" role="region" aria-label="Project Carousel">
      <div className="section-content">
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-subtitle">Here are some of my recent works in the Web3 space.</p>
        <div className="carousel-container">
          <button
            className="carousel-button carousel-button-prev"
            onClick={prev}
            onKeyDown={(e) => handleKeyDown(e, 'prev')}
            disabled={currentGroup === 0}
            aria-label="Groupe de projets précédent"
            tabIndex={0}
          >
            ❮
          </button>
          <div className="carousel-content-wrapper">
            <div ref={carouselRef} className="carousel-content" role="list">
              {projectsData.map((project) => (
                <div key={project.id} className="carousel-item" role="listitem">
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
            onKeyDown={(e) => handleKeyDown(e, 'next')}
            disabled={currentGroup === totalGroups - 1}
            aria-label="Next project group"
            tabIndex={0}
          >
            ❯
          </button>
        </div>
        <div className="carousel-dots" role="navigation" aria-label="Dot nav carousel">
          {Array.from({ length: totalGroups }).map((_, index) => (
            <button
              key={`dot-${index}`}
              className={`carousel-dot ${index === currentGroup ? 'active' : ''}`}
              onClick={() => goToGroup(index)}
              aria-label={`Go to project group ${index + 1}`}
              aria-current={index === currentGroup ? 'true' : 'false'}
              tabIndex={0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectCarousel;