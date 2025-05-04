export default function GradientText({ content }) {
  return (
    <div className="text-6xl font-bold md:text-7xl">
      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        {content}
      </span>
    </div>
  );
}
