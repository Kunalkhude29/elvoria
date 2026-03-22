export default function Footer() {
    return (
        <footer className="bg-cream border-t border-gray-100 pt-16 pb-8">
            <div className="container grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-serif font-bold text-charcoal">ELVORIA</h3>
                    <p className="text-sm text-charcoal/60 leading-relaxed">
                        Modern gold and silver jewellery for everyday elegance. Designed for the modern muse.
                    </p>
                </div>

                {/* About */}
                <div>
                    <h4 className="font-serif font-bold mb-4 text-charcoal">About ELVORIA</h4>
                    <ul className="space-y-2 text-sm text-charcoal/70">
                        <li><a href="#" className="hover:text-gold transition-colors">Our Story</a></li>
                        <li><a href="#" className="hover:text-gold transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-gold transition-colors">Sustainability</a></li>
                        <li><a href="#" className="hover:text-gold transition-colors">Press</a></li>
                    </ul>
                </div>

                {/* Customer Care */}
                <div>
                    <h4 className="font-serif font-bold mb-4 text-charcoal">Customer Care</h4>
                    <ul className="space-y-2 text-sm text-charcoal/70">
                        <li><a href="#" className="hover:text-gold transition-colors">Contact Us</a></li>
                        <li><a href="#" className="hover:text-gold transition-colors">Shipping & Returns</a></li>
                        <li><a href="#" className="hover:text-gold transition-colors">Warranty</a></li>
                        <li><a href="#" className="hover:text-gold transition-colors">FAQ</a></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="font-serif font-bold mb-4 text-charcoal">Stay in Touch</h4>
                    <p className="text-sm text-charcoal/60 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
                    <form className="flex border-b border-charcoal pb-2">
                        <input type="email" placeholder="Enter your email" className="bg-transparent flex-1 outline-none text-sm placeholder-charcoal/40" />
                        <button type="button" className="text-xs uppercase tracking-widest font-bold hover:text-gold transition-colors">Subscribe</button>
                    </form>
                </div>
            </div>

            <div className="container border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-charcoal/40">
                <p>&copy; {new Date().getFullYear()} ELVORIA. All rights reserved.</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-charcoal transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-charcoal transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}
