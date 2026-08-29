export default function Footer() {
  return (
    <footer className="bg-[#0F1419] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">
              Mall1<span className="text-[#FF6A00]">Tandoori</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your premier destination for cinematic entertainment at Mall-1
              Burewala. Experience movies like never before with our state-of-the-art
              sound and visual technology.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-[#FF6A00] mb-4">
              Contact Us
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#FF6A00]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                0300-1234567
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#FF6A00]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Mall-1, Burewala, Punjab, Pakistan
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#FF6A00]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                info@mall1tandoori.com
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-[#FF6A00] mb-4">
              Showtimes
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Daily: 11:00 AM — 12:00 AM</li>
              <li>Friday Special: 2:00 PM — 12:00 AM</li>
              <li>Holidays: 10:00 AM — 12:00 AM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          © 2026 Mall1Tandoori Cinema. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
