import {Star, Zap} from 'lucide-react';

const About = () => {

  const testimonials = [
    {
      name: 'Feltham1977',
      country: 'Hertfordshire, UK',
      rating: 5,
      text: "With thanks to Trip Advisor, I came across this company and decided to book two tours with them. One, being the private Petra tour and the other was the Sunset jeep tour of Wadi Rum.\
            I highly recommend this company to anyone looking to book a trip in Jordan. Rebecca in the Aqaba office, handled our bookings. She is from Italy, and fluent in a handful of languages. No detail was lost in translation.\
            Nazeh was our driver for the Petra tour and our guide for the Wadi Rum tour. He was great to chat too and full of information.\
            Mamoun was our guide in Petra. He was fantastic. Incredibly knowledgeable and his English was incredibly good.\
            If/when I return to Jordan, I'll be in touch with this company again to book further tours.\
            I cannot recommend highly enough."
    },
    {
      name: 'TanRej',
      country: 'Mont-Saint-Hilaire, Canada',
      rating: 5,
      text: "We decided not to stay in Wadi Rum, but instead to base ourselves in Aqaba and go for the day.\
      We found this company through several sources and liked the range of day trip options.\
      Prices were reasonable compared to other companies and good value for what was included.\
      Communication prior to our departure was easy, response rate was quick and they were flexible.\
      We opted to call in at the office the day prior to our trip to pay and organise pick-up.\
      At about 4:30 am, a car was waiting for us.\
      We were just the two of us with the driver (I think it was Mr Khalid - a photo is included), who spoke very good English and was great company for the day.\
      We did a balloon ride and then a 3 h trip in a 4x4 with lots of stops and tea at a camp. The balloon ride was organised with another company (another review).\
      We had another driver for the 4x4 and Mr Khalid came with us.\
      While the 4x4 vehicle was not the flashest,\
      it was the best because we were only the two of us in the back compared to the fancy trucks with 8-10 squashed in \
      plus our drivers tried to take us to the sites between the groups so we felt like we were alone. We had a brilliant day and highly recommend Above and Beyond."
    },
    {
      name: 'srinivasan c',
      country: 'Dubai, United Arab Emirates',
      rating: 5,
      text: 'Last week we booked day tours with Above and below adventures.\
      First one is to Petra and wadi rum,another one is Dead sea, baptism site Madaba. \
      The Petra trip they arranged with new car.The driver is very nice person with good knowledge of the roads and sites.\
      They arrange very good Jordanian traditional lunch.After Petra visit we enjoyed wadi rum dunes and spectacular rocky mountains.\
      We enjoyed the sun set in wadi rum.It is really beautiful. Next day we visited Dead sea and baptism site.This is little long drive the driver make this trip enjoyable.\
      Thank you Above and below adventures.'
    }
  ];

  return (
    <section id="about" className="w-full min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-900 relative overflow-x-hidden">
      {/* Full-width background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[15%] left-[15%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-[15%] right-[15%] w-[40%] h-[40%] bg-purple-500/20 rounded-full filter blur-[100px]"></div>
      </div>
      
      {/* Full-bleed content container */}
      <div className="w-full min-h-screen mx-0 px-0">
        {/* About Us Section - completely edge-to-edge */}
        <div className="w-full px-0 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-none px-8">
            <div className="z-10">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-cyan-400/20">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-300 font-semibold tracking-wide">ABOUT ABOVE & BELOW ADVENTURES EXPERIENCE</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight">
                REDEFINING 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 block mt-4">ADVENTURE</span>
              </h2>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed font-light">
                We pioneer the future of experiential travel, merging cutting-edge technology with authentic cultural immersion. 
                We don't just show you destinations – we help you become part of their living story.
              </p>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light">
                Through innovative storytelling, immersive technologies, and exclusive access to hidden gems, 
                we create transformative journeys that resonate long after you return home.
              </p>
              
              <div className="grid grid-cols-2 gap-8 max-w-xl">
                <div className="text-center bg-gray-900/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/30">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">15+Years</div>
                  <div className="text-gray-400 text-sm font-medium">Experience</div>
                </div>
                <div className="text-center bg-gray-900/40 backdrop-blur-sm p-6 rounded-xl border border-gray-700/30">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">5000+</div>
                  <div className="text-gray-400 text-sm font-medium">Travel Memories</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 w-full">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-cyan-500/20 transform hover:scale-[1.02] transition-all duration-500 w-full">
                <div className="aspect-video bg-gradient-to-r from-cyan-500/10 to-purple-500/10 w-full">
                  <img
                    src="https://www.dive-inaqaba.com/wp-content/uploads/aqaba.webp"
                    alt="Adventure landscape"
                    className="w-full h-full object-cover"
                  />
                </div>
               
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section - full width */}
        <div className="w-full px-8 py-16">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-6">Traveler Experiences</h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
              Discover what makes our journeys extraordinary through our travelers' stories
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 w-full"
              >
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-cyan-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 font-light leading-relaxed italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.country}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;