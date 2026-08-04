import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 font-['Playfair_Display',_'Merriweather',_serif]">Contact Us</h1>
        <p className="text-slate-600">Get in touch with the Prime Tamil editorial team</p>
        <div className="h-1.5 w-24 bg-[#D90429] mt-3 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 font-['Playfair_Display',_'Merriweather',_serif]">Send us a message</h2>

            {submitted && (
              <div className="bg-green-50 border border-green-400 text-green-800 rounded-xl p-4 mb-6">
                <p className="font-semibold">Thank you for reaching out!</p>
                <p className="text-sm mt-1">We'll get back to you as soon as possible.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90429] focus:bg-white outline-none transition text-sm"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90429] focus:bg-white outline-none transition text-sm"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90429] focus:bg-white outline-none transition text-sm"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#D90429] focus:bg-white outline-none transition resize-none text-sm"
                  placeholder="Your message here..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#D90429] text-white py-3 rounded-full font-semibold hover:bg-red-700 transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <Send size={18} />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 font-['Playfair_Display',_'Merriweather',_serif]">Contact Information</h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-red-50 text-[#D90429] p-3 rounded-xl border border-red-100 flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                  <a
                    href="mailto:editor@primetamil.com"
                    className="text-slate-600 hover:text-[#D90429] transition text-sm"
                  >
                    editor@primetamil.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-red-50 text-[#D90429] p-3 rounded-xl border border-red-100 flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Phone</h3>
                  <a
                    href="tel:+919500980047"
                    className="text-slate-600 hover:text-[#D90429] transition text-sm"
                  >
                    +91 95009 80047
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-red-50 text-[#D90429] p-3 rounded-xl border border-red-100 flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Address</h3>
                  <p className="text-slate-600 text-sm">
                    Chennai / Coimbatore, Tamil Nadu<br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8">
            <div className="flex items-center space-x-2.5 mb-4">
              <span className="w-1.5 h-5 bg-[#D90429] rounded-full inline-block"></span>
              <h3 className="text-xl font-bold text-slate-900 font-['Playfair_Display',_'Merriweather',_serif]">Have a News Tip?</h3>
            </div>
            <p className="text-slate-600 text-sm mb-5 leading-relaxed">
              If you have a story idea, confidential news tip, or document you'd like to share with our editors,
              we'd love to hear from you. Your insights help us serve our readership better.
            </p>
            <a
              href="mailto:editor@primetamil.com?subject=News Tip"
              className="inline-block bg-[#D90429] text-white hover:bg-red-700 px-6 py-2.5 rounded-full font-semibold text-sm transition shadow-sm"
            >
              Submit a News Tip
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8">
            <div className="flex items-center space-x-2.5 mb-4">
              <span className="w-1.5 h-5 bg-[#D90429] rounded-full inline-block"></span>
              <h3 className="text-xl font-bold text-slate-900 font-['Playfair_Display',_'Merriweather',_serif]">Advertise With Us</h3>
            </div>
            <p className="text-slate-600 text-sm mb-5 leading-relaxed">
              Reach thousands of engaged readers across Tamil Nadu and global diaspora. Contact us to learn about our
              premium digital advertising opportunities and editorial sponsorships.
            </p>
            <a
              href="mailto:editor@primetamil.com?subject=Advertising Inquiry"
              className="inline-block border border-slate-300 text-slate-800 px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
