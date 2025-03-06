import { useState, useEffect, useRef, useCallback } from 'react';
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

  // Calcul du nombre total de groupes
  const totalGroups = Math.ceil(projectsData.length / visibleProjects) || 1;
  // Ajustement pour desktop avec 4 projets
  const isDesktopWithExtra = window.innerWidth >= 1024 && projectsData.length === 4;
  const adjustedTotalGroups = isDesktopWithExtra ? 2 : totalGroups;

  // Défilement vers le groupe suivant
  const next = useCallback(() => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    const newGroup = Math.min(currentGroup + 1, adjustedTotalGroups - 1);
    
    let newScrollLeft;
    if (isDesktopWithExtra && newGroup === 1) {
      // Dernier projet (4e) prend toute la largeur sur desktop
      newScrollLeft = 3 * itemWidth; // Position après les 3 premiers projets
    } else {
      newScrollLeft = newGroup * visibleProjects * itemWidth;
    }
    
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    setCurrentGroup(newGroup);
  }, [currentGroup, visibleProjects, adjustedTotalGroups, isDesktopWithExtra]);

  // Défilement vers le groupe précédent
  const prev = useCallback(() => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    const newGroup = Math.max(currentGroup - 1, 0);
    const newScrollLeft = newGroup * visibleProjects * itemWidth;
    
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    setCurrentGroup(newGroup);
  }, [currentGroup, visibleProjects]);

  // Synchronisation de l’index avec le défilement manuel
  useEffect(() => {
    const handleScroll = () => {
      if (!carouselRef.current) return;
      const scrollLeft = carouselRef.current.scrollLeft;
      const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
      let newGroup;
      if (isDesktopWithExtra && scrollLeft >= 3 * itemWidth) {
        newGroup = 1;
      } else {
        newGroup = Math.round(scrollLeft / (itemWidth * visibleProjects));
      }
      setCurrentGroup(newGroup);
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', handleScroll);
      return () => carousel.removeEventListener('scroll', handleScroll);
    }
  }, [visibleProjects, isDesktopWithExtra]);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(next, 7000);
    return () => clearInterval(interval);
  }, [next]);

  // Aller à un groupe spécifique via les dots
  const goToGroup = useCallback((groupIndex: number) => {
    if (!carouselRef.current) return;
    const itemWidth = carouselRef.current.scrollWidth / projectsData.length;
    let newScrollLeft;
    if (isDesktopWithExtra && groupIndex === 1) {
      newScrollLeft = 3 * itemWidth; // Position du 4e projet
    } else {
      newScrollLeft = groupIndex * visibleProjects * itemWidth;
    }
    carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    setCurrentGroup(groupIndex);
  }, [visibleProjects, isDesktopWithExtra]);

  return (
    <section id="projects" className="section section-dark" role="region" aria-label="Featured Projects Carousel">
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
            disabled={currentGroup === adjustedTotalGroups - 1}
            aria-label="Next project group"
          >
            ❯
          </button>
        </div>
        
        <div className="carousel-dots">
          {Array.from({ length: adjustedTotalGroups }).map((_, index) => (
            <button
              key={`dot-${index}`}
              className={`carousel-dot ${index === currentGroup ? 'active' : ''}`}
              onClick={() => goToGroup(index)}
              aria-label={`Go to project group ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectCarousel;