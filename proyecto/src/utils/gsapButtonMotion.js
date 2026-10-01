import gsap from 'gsap';

const animate = (element, vars) => gsap.to(element, { duration: 0.14, ease: 'power2.out', ...vars });

export const gsapButtonMotion = {
  onPointerEnter: ({ currentTarget }) => animate(currentTarget, { x: -1, y: -1 }),
  onPointerLeave: ({ currentTarget }) => animate(currentTarget, { x: 0, y: 0, scale: 1 }),
  onPointerDown: ({ currentTarget }) => animate(currentTarget, { x: 3, y: 3, scale: 0.98 }),
  onPointerUp: ({ currentTarget }) => animate(currentTarget, { x: -1, y: -1, scale: 1 }),
};