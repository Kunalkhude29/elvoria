export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="main-container grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-outfit font-bold text-charcoal">SHWETA</h3>
                    <p className="text-sm font-outfit text-charcoal/60 leading-relaxed">
                        Modern gold plated and forming jewellery for everyday elegance. Designed for the modern muse.
                    </p>
                </div>

                {/* About */}
                <div>
                    <h4 className="font-outfit font-bold mb-4 text-charcoal">About SHWETA</h4>
                    <ul className="space-y-2 text-sm font-outfit text-charcoal/70">
                        <li><a href="#" className="hover:text-gold transition-colors">Our Story</a></li>
                    </ul>
                </div>

                {/* Customer Care */}
                <div>
                    <h4 className="font-outfit font-bold mb-4 text-charcoal">Customer Care</h4>
                    <ul className="space-y-2 text-sm font-outfit text-charcoal/70">
                        <li><a href="/customer-care" className="hover:text-gold transition-colors">Contact Us</a></li>
                        <li><a href="/customer-care" className="hover:text-gold transition-colors">Shipping & Returns</a></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="font-outfit font-bold mb-4 text-charcoal">Stay in Touch</h4>
                    <p className="text-sm font-outfit text-charcoal/60 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
                    <form className="flex border-b border-charcoal pb-2">
                        <input type="email" placeholder="Enter your email" className="bg-transparent flex-1 outline-none text-sm placeholder-charcoal/40" />
                        <button type="button" className="text-xs font-outfit font-semibold uppercase tracking-widest font-bold hover:text-gold transition-colors">Subscribe</button>
                    </form>
                </div>
            </div>

            <div className="main-container border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-outfit text-charcoal/40">
                <p>&copy; {new Date().getFullYear()} SHWETA. All rights reserved.</p>
                <div className="flex space-x-6 mt-4 md:mt-0 font-outfit">
                    <a href="#" className="hover:text-charcoal transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-charcoal transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}
