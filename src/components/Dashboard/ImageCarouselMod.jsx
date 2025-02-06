export default function ImageCarouselMod({ images, currentIndex, setIndex }) {
  const nextImage = () =>
    setIndex((prevIndex) => (prevIndex + 1) % images.length);

  const prevImage = () =>
    setIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );

  return (
    <div className="mt-[5px] relative">
      <img
        src={images[currentIndex] || ""}
        alt="Memory"
        className="w-full h-[80vh] object-cover rounded-xl transition-transform duration-500 ease-in-out"
      />
      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4">
        <button
          onClick={prevImage}
          className="text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full"
        >
          &#60;
        </button>
        <button
          onClick={nextImage}
          className="text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full"
        >
          &#62;
        </button>
      </div>
    </div>
  );
}
