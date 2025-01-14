import { Transition } from '@headlessui/react';
import { useState } from 'react';

interface CarouselProps<T> {
  slides: T[];
  renderSlide: (slide: T, index: number) => JSX.Element;
};

export function Carousel<T> ({slides, renderSlide}: CarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [moving, setMoving] = useState("right");

  const nextSlide = () => {
    setMoving("right");
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setMoving("left");
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  };

  return (
    <div className="relative w-full h-[24rem] mx-auto">
      <div className="overflow-hidden">
        {slides.map((slide, index) => (
          <Transition
            key={index}
            show={index === currentIndex}
            enter="transform transition ease-in-out duration-500"
            enterFrom={
              moving === "right"
                ? `translate-x-full opacity-0`
                : `-translate-x-full opacity-0`
            }
            enterTo="opacity-100 translate-x-0"
            leave="transform transition ease-in-out duration-500"
            leaveFrom="opacity-100 translate-x-0"
            leaveTo={
              moving === "right"
                ? `-translate-x-full opacity-0`
                : `translate-x-full opacity-0`
            }
          >
            <div
              className={`absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-100`}
            >
              {renderSlide(slide, index)}
            </div>
          </Transition>
        ))}
      </div>

      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 px-4">
        <button
          onClick={prevSlide}
          className="bg-black text-white p-2 rounded-full"
        >
          &#10094;
        </button>
      </div>
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 px-4">
        <button
          onClick={nextSlide}
          className="bg-black text-white p-2 rounded-full"
        >
          &#10095;
        </button>
      </div>
    </div>
  );
};
