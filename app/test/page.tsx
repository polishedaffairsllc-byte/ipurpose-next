import Image from 'next/image';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl mb-8 font-bold">Image Test Page</h1>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Test 1: Next Image with unoptimized */}
        <div>
          <h2 className="text-xl mb-4 font-semibold">Next Image (unoptimized)</h2>
          <div className="relative w-full h-64 bg-gray-200 border-2 border-black">
            <Image
              src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400"
              alt="Test 1"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* Test 2: Regular img tag */}
        <div>
          <h2 className="text-xl mb-4 font-semibold">Regular img tag</h2>
          <div className="border-2 border-black">
            <img
              src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400"
              alt="Test 2"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>

        {/* Test 3: Local gradient */}
        <div>
          <h2 className="text-xl mb-4 font-semibold">Gradient (no image)</h2>
          <div className="w-full h-64 bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-black"></div>
        </div>

        {/* Test 4: Canvas test */}
        <div>
          <h2 className="text-xl mb-4 font-semibold">Colored box</h2>
          <div className="w-full h-64 bg-blue-500 flex items-center justify-center text-white text-2xl border-2 border-black">
            Can you see this?
          </div>
        </div>
      </div>
    </div>
  );
}
