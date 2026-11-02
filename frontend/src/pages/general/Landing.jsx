import { Link } from 'react-router-dom'
import { getUserId } from '../../utils/userSession'
import '../../styles/landing.css'

const Landing = () => {
  const isUserSignedIn = Boolean(getUserId())

  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="landing-brand" to="/" aria-label="FoodReels home">
          <span className="landing-brand-mark" aria-hidden="true">F</span>
          <span>FoodReels</span>
        </Link>
        <nav className="landing-nav-links" aria-label="Main navigation">
          <a href="#about">About</a>
          {isUserSignedIn ? <Link to="/explore">Explore</Link> : <Link to="/user/login">Sign in</Link>}
        </nav>
        <a className="landing-nav-join" href="#join">Join us</a>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow"><span aria-hidden="true">&#10022;</span> Watch it. Crave it. Order it.</p>
          <h1 id="landing-title">See the food. <em>Order</em> what you love.</h1>
          <p className="landing-lede">Watch real food reels from local kitchens, find the dish that makes you stop scrolling, and order it in just a few taps.</p>
          <div className="landing-hero-actions">
            <Link className="landing-button landing-button--primary" to={isUserSignedIn ? '/explore' : '/user/login'}>
              {isUserSignedIn ? 'Watch food reels' : 'Sign in to start watching'} <span aria-hidden="true">&rarr;</span>
            </Link>
            <a className="landing-button landing-button--quiet" href="#about">How it works</a>
          </div>
          <p className="landing-payment-note"><span aria-hidden="true">✓</span> Secure checkout powered by Razorpay</p>
        </div>

        <div className="landing-showcase" aria-label="A preview of food reels">
          <div className="landing-orbit landing-orbit--one" aria-hidden="true">&#10022;</div>
          <div className="landing-orbit landing-orbit--two" aria-hidden="true">&#8226;</div>
          <article className="landing-feature-card">
            <div className="landing-feature-image landing-feature-image--main" aria-hidden="true">
              <span>&#x1F35C;</span>
            </div>
            <div className="landing-feature-details">
              <div>
                <p>Trending near you · ₹249</p>
                <strong>Chilli garlic ramen</strong>
              </div>
              <span className="landing-heart" aria-label="Add to cart">+</span>
            </div>
          </article>
          <div className="landing-mini-card landing-mini-card--one">
            <span aria-hidden="true">&#x1F96D;</span>
            <div><strong>Fresh finds</strong><small>See it. Add it. Eat it.</small></div>
          </div>
          <div className="landing-mini-card landing-mini-card--two">
            <span className="landing-mini-play" aria-hidden="true">&gt;</span>
            <div><strong>Order from reels</strong><small>Your next meal is a tap away</small></div>
          </div>
        </div>
      </section>

      <section className="landing-about" id="about" aria-labelledby="about-title">
        <div>
          <p className="landing-section-label">Why FoodReels</p>
          <h2 id="about-title">From a food reel to your cart in a few taps.</h2>
        </div>
        <div className="landing-about-copy">
          <p>Skip guesswork and menus that do not show the real dish. FoodReels lets you watch the texture, portion, and personality of a meal before choosing what to order.</p>
          <div className="landing-value-list">
            <div><span>01</span><strong>Watch real food reels</strong></div>
            <div><span>02</span><strong>Add the dishes you love to cart</strong></div>
            <div><span>03</span><strong>Pay securely and enjoy</strong></div>
          </div>
        </div>
      </section>

      <section className="landing-join" id="join" aria-labelledby="join-title">
        <div className="landing-join-heading">
          <p className="landing-section-label">Choose your side of the table</p>
          <h2 id="join-title">Join FoodReels</h2>
          <p>Whether you are looking for a meal or ready to showcase one, your account starts here.</p>
        </div>
        <div className="landing-account-grid">
          <article className="landing-account-card">
            <span className="landing-account-icon" aria-hidden="true">&#8981;</span>
            <p className="landing-card-label">For food lovers</p>
            <h3>Watch it, then order it.</h3>
            <p>See real dishes in motion, add the ones you love to cart, and complete your order through secure Razorpay checkout.</p>
            <div className="landing-account-actions">
              <Link className="landing-card-link" to="/user/login">User login</Link>
              <Link className="landing-card-link landing-card-link--outline" to="/user/register">User register</Link>
            </div>
          </article>
          <article className="landing-account-card landing-account-card--partner">
            <span className="landing-account-icon" aria-hidden="true">&#10035;</span>
            <p className="landing-card-label">For food partners</p>
            <h3>Put your best dishes in motion.</h3>
            <p>Upload reels, manage your menu, and help new customers find your food.</p>
            <div className="landing-account-actions">
              <Link className="landing-card-link" to="/food-partner/login">Partner login</Link>
              <Link className="landing-card-link landing-card-link--outline" to="/food-partner/register">Partner register</Link>
            </div>
          </article>
        </div>
      </section>

      <footer className="landing-footer">
        <Link className="landing-brand" to="/"><span className="landing-brand-mark" aria-hidden="true">F</span><span>FoodReels</span></Link>
        <span>Watch food. Love a dish. Order it.</span>
      </footer>
    </main>
  )
}

export default Landing
