// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 MOVIE DETAILS MODAL - CODE BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════════
// 1️⃣ CARD RENDERING (Updated)
// ═══════════════════════════════════════════════════════════════════════════════

// BEFORE:
// <div class="content-card">
//   <div class="content-thumb" ...>
//     <span class="content-badge">PG-13</span>
//   </div>
// </div>

// AFTER:
// <div class="content-card" data-content-id="1" data-title="Avatar" 
//      onclick="openMovieModal(this)">
//   <div class="content-thumb" ...>
//     <span class="content-badge">PG-13</span>
//   </div>
// </div>

// KEY CHANGES:
// • Added data-content-id="${c.Content_ID}"      ← Store movie ID
// • Added data-title="${c.Title}"                ← Store movie title  
// • Added onclick="openMovieModal(this)"         ← Click handler
// • Watch button: onclick="event.stopPropagation();..." ← Prevent card click


// ═══════════════════════════════════════════════════════════════════════════════
// 2️⃣ MODAL HTML STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════

/*
<div class="modal-overlay" id="movieModal">
  <div class="modal-content">
    
    <!-- POSTER SECTION -->
    <div class="modal-header" id="modalPoster" style="background-image:url('')">
      <button class="close-btn" onclick="closeMovieModal()">✕</button>
    </div>
    
    <!-- CONTENT SECTION -->
    <div class="modal-body">
      
      <!-- TITLE -->
      <h2 id="modalTitle">Loading...</h2>
      
      <!-- META INFO: Language, Duration, Rating, Year -->
      <div class="modal-meta">
        <span id="modalLanguage">English</span>
        <span id="modalDuration">120m</span>
        <span><span class="badge" id="modalRating">PG-13</span></span>
        <span id="modalYear">2024</span>
      </div>
      
      <!-- RATING WITH STARS -->
      <div class="modal-rating">
        <span class="imdb">IMDB <span id="modalIMDB">7.5</span>/10</span>
        <span class="stars"><span id="modalStars">★★★★★</span></span>
      </div>
      
      <!-- DESCRIPTION -->
      <p class="modal-description" id="modalDescription">Loading description...</p>
      
      <!-- DETAILS BOX -->
      <div class="modal-details">
        <div class="modal-details-item">
          <label>Genre</label>
          <value id="modalGenreDetail">Action, Thriller</value>
        </div>
        <div class="modal-details-item">
          <label>Director</label>
          <value id="modalDirector">Unknown</value>
        </div>
        <!-- More items... -->
      </div>
      
      <!-- CAST (Optional) -->
      <div id="castSection" style="display:none">
        <div class="modal-cast">
          <h4>Cast</h4>
          <div class="modal-cast-list" id="modalCast"></div>
        </div>
      </div>
      
      <!-- ACTION BUTTONS -->
      <div class="modal-actions">
        <button class="modal-btn primary" onclick="watchMovie()">▶ Watch Now</button>
        <button class="modal-btn secondary" onclick="addToWatchlist()">+ Watchlist</button>
        <button class="modal-btn secondary" onclick="closeMovieModal()">Close</button>
      </div>
      
    </div>
  </div>
</div>
*/


// ═══════════════════════════════════════════════════════════════════════════════
// 3️⃣ JAVASCRIPT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ──── OPEN MODAL ──────────────────────────────────────────────────────────────

async function openMovieModal(cardElement) {
  // Extract data from card element
  const contentId = cardElement.getAttribute('data-content-id');
  const title = cardElement.getAttribute('data-title');
  
  // Show modal
  const modal = document.getElementById('movieModal');
  modal.classList.add('active');  // Triggers CSS animation
  
  // Disable body scroll (prevent background scrolling)
  document.body.style.overflow = 'hidden';
  
  try {
    // FETCH DETAILED MOVIE DATA FROM API
    const response = await fetch(`${API}/content/${contentId}`);
    const movieData = response.ok ? await response.json() : null;
    
    if (movieData) {
      // API returned data, use it
      currentMovieData = movieData[0] || movieData;
      populateModal(currentMovieData);
    } else {
      // Fallback: Build data from card info if API fails
      const allCards = document.querySelectorAll('[data-content-id]');
      for (let card of allCards) {
        if (card.getAttribute('data-content-id') === contentId) {
          const meta = card.querySelector('.meta');
          const genre = card.querySelector('.genre-tag');
          currentMovieData = {
            Content_ID: contentId,
            Title: title,
            Language: meta ? meta.textContent.split('•')[0].trim() : 'Unknown',
            Duration: meta ? meta.textContent.split('•')[1].trim() : 'N/A',
            Genre: genre ? genre.textContent : 'General',
            Age_Rating: card.querySelector('.content-badge')?.textContent || 'NR',
            Poster_Image_URL: card.querySelector('.content-thumb')?.style.backgroundImage.match(/url\("?([^"]*)"?\)/)?.[1] || '',
            Description: 'This is a featured title in our collection.',
            IMDB_Rating: 7.5,
            Release_Date: new Date().getFullYear()
          };
          populateModal(currentMovieData);
          break;
        }
      }
    }
  } catch (e) {
    console.error('Error loading movie details:', e);
    toast('Error loading movie details', 'error');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}


// ──── POPULATE MODAL ──────────────────────────────────────────────────────────

function populateModal(data) {
  // Set poster image
  document.getElementById('modalPoster').style.backgroundImage = 
    `url('${data.Poster_Image_URL || ''}')`;
  
  // Set title
  document.getElementById('modalTitle').textContent = data.Title || 'Unknown Title';
  
  // Set metadata
  document.getElementById('modalLanguage').textContent = data.Language || 'Unknown';
  document.getElementById('modalDuration').textContent = data.Duration ? `${data.Duration}m` : 'Series';
  document.getElementById('modalRating').textContent = data.Age_Rating || 'NR';
  document.getElementById('modalYear').textContent = 
    data.Release_Date ? new Date(data.Release_Date).getFullYear() : new Date().getFullYear();
  
  // Set rating and stars
  const rating = data.IMDB_Rating || 7.5;
  document.getElementById('modalIMDB').textContent = rating.toFixed(1);
  document.getElementById('modalStars').textContent = calculateStars(rating * 2);
  
  // Set description
  document.getElementById('modalDescription').textContent = 
    data.Description || 'No description available.';
  
  // Set details
  document.getElementById('modalGenreDetail').textContent = data.Genre || 'General';
  document.getElementById('modalDirector').textContent = data.Director || 'Not available';
  document.getElementById('modalType').textContent = data.Type || 'Movie';
  document.getElementById('modalID').textContent = data.Content_ID || '-';
  
  // Set cast (if available)
  if (data.Cast) {
    const castArray = data.Cast.split(',').map(c => c.trim()).slice(0, 6);
    document.getElementById('modalCast').innerHTML = 
      castArray.map(actor => `<div class="modal-cast-item">${actor}</div>`).join('');
    document.getElementById('castSection').style.display = 'block';
  } else {
    document.getElementById('castSection').style.display = 'none';
  }
}


// ──── CALCULATE STARS RATING ──────────────────────────────────────────────────

function calculateStars(rating) {
  // rating is 0-10 (sometimes 0-20)
  // return 5 stars: ★★★★★ or mix: ★★★★☆ or ⯨ for half
  const fullStars = Math.floor(rating / 2);
  const hasHalf = rating % 2 >= 1;
  let stars = '';
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars += '★';           // Full star
    else if (i === fullStars && hasHalf) stars += '⯨';  // Half star
    else stars += '☆';                         // Empty star
  }
  
  return stars;
}


// ──── CLOSE MODAL ──────────────────────────────────────────────────────────────

function closeMovieModal() {
  const modal = document.getElementById('movieModal');
  modal.classList.remove('active');  // Triggers CSS animation (reverse)
  document.body.style.overflow = 'auto';  // Re-enable body scroll
  currentMovieData = null;  // Clear stored data
}


// ──── WATCH NOW ──────────────────────────────────────────────────────────────

function watchMovie() {
  if (!currentMovieData) return;
  
  // Add to watch history
  addWatch(currentMovieData.Content_ID, currentMovieData.Title);
  
  // Show notification
  toast(`Playing "${currentMovieData.Title}"...`);
  
  // Close modal
  closeMovieModal();
  
  // In real implementation, would navigate to player
  // window.location.href = `/player/${currentMovieData.Content_ID}`;
}


// ──── ADD TO WATCHLIST ──────────────────────────────────────────────────────

async function addToWatchlist() {
  if (!currentMovieData) {
    toast('Error: Movie data not found', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.User_ID,
        content_id: currentMovieData.Content_ID
      })
    });
    
    if (response.ok) {
      toast(`"${currentMovieData.Title}" added to watchlist ✓`);
    } else {
      toast('Failed to add to watchlist', 'error');
    }
  } catch (e) {
    toast(e.message, 'error');
  }
}


// ──── CLOSE ON BACKGROUND CLICK ──────────────────────────────────────────────

document.getElementById('movieModal')?.addEventListener('click', function(e) {
  // Only close if clicking directly on overlay, not on modal content
  if (e.target === this) {
    closeMovieModal();
  }
});


// ──── CLOSE ON ESCAPE KEY ──────────────────────────────────────────────────────

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && document.getElementById('movieModal').classList.contains('active')) {
    closeMovieModal();
  }
});


// ═══════════════════════════════════════════════════════════════════════════════
// 4️⃣ MODAL CSS STYLES (KEY PARTS)
// ═══════════════════════════════════════════════════════════════════════════════

/*
// MODAL OVERLAY (backdrop with blur)
.modal-overlay {
  position: fixed;
  inset: 0;  ← Cover entire screen
  background: rgba(0, 0, 0, .7);  ← Dark overlay
  backdrop-filter: blur(4px);  ← Blur effect
  z-index: 1000;  ← On top of everything
  opacity: 0;  ← Hidden by default
  visibility: hidden;  ← Not interactive
  transition: .3s;  ← Smooth animation
}

// WHEN MODAL IS ACTIVE
.modal-overlay.active {
  opacity: 1;  ← Fully visible
  visibility: visible;  ← Can interact
}

// MODAL CONTENT
.modal-content {
  background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
  border-radius: 16px;
  max-width: 800px;  ← Desktop size
  width: 90%;  ← Mobile: 90% of screen
  max-height: 90vh;  ← Scrollable if needed
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .8);
  
  // Animation on open
  animation: modalSlideIn .4s ease-out;
}

// SLIDE IN ANIMATION
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(.9) translateY(20px);  ← Starts small and down
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);  ← Ends normal size
  }
}

// MODAL HEADER (poster image)
.modal-header {
  height: 300px;
  background-size: cover;
  background-position: center;
  position: relative;
}

// Gradient overlay on poster
.modal-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, #0d0d0d 100%);
  ← Gradual fade to black at bottom
}

// Close button
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, .7);
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  transition: .2s;
}

.close-btn:hover {
  background: var(--red);  ← Red on hover
  transform: scale(1.1);  ← Grow slightly
}

// ACTION BUTTONS
.modal-btn.primary {
  background: var(--red);  ← Netflix red
  color: #fff;
}

.modal-btn.primary:hover {
  background: var(--red2);  ← Darker red
  transform: translateY(-2px);  ← Lift up
  box-shadow: 0 8px 20px rgba(229, 9, 20, .4);  ← Glow
}

.modal-btn.secondary {
  background: #1c1c1c;  ← Dark background
  color: #aaa;  ← Gray text
  border: 1px solid #333;
}

.modal-btn.secondary:hover {
  background: #222;
  border-color: var(--red);  ← Red border on hover
  color: var(--red);
}
*/


// ═══════════════════════════════════════════════════════════════════════════════
// 5️⃣ API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

/*
// GET ALL CONTENT (for browse page)
GET /api/content?genre=Sci-Fi&language=English&search=Avatar
Returns: [
  {
    Content_ID: 1,
    Title: "Avatar",
    Genre: "Sci-Fi, Action",
    Language: "English",
    Duration: 162,
    Age_Rating: "PG-13",
    Poster_Image_URL: "https://...",
    Description: "...",
    IMDB_Rating: 7.8,
    Director: "James Cameron",
    Type: "Movie",
    Cast: "Sam Worthington, Zoe Saldana",
    Release_Date: "2009-12-18"
  },
  ...
]

// GET SINGLE CONTENT (for modal)
GET /api/content/1
Returns: [{ same structure as above }]

// ADD TO WATCH HISTORY
POST /api/watch
Body: { user_id: 1, content_id: 5 }
Returns: { message: "Added to watch history" }

// ADD TO WATCHLIST
POST /api/watchlist
Body: { user_id: 1, content_id: 5 }
Returns: { message: "Added to watchlist" }

// GET WATCHLIST
GET /api/watchlist/1
Returns: [{ watchlist items with full content details }]
*/


// ═══════════════════════════════════════════════════════════════════════════════
// 6️⃣ DATA FLOW DIAGRAM
// ═══════════════════════════════════════════════════════════════════════════════

/*
USER INTERACTION:
  Click Movie Card
       ↓
  openMovieModal(cardElement) called
       ↓
  Extract contentId from data attribute
       ↓
  Show modal overlay (.modal-overlay.active)
       ↓
  Fetch movie details: GET /api/content/{contentId}
       ↓
  API returns full movie data
       ↓
  populateModal(movieData) updates all fields
       ↓
  Modal displays with animation
       ↓
  User interacts (Watch, Watchlist, Close)
       ↓
  closeMovieModal() removes .active class
       ↓
  Modal disappears with animation
       ↓
  Back to browse page
*/


// ═══════════════════════════════════════════════════════════════════════════════
// 7️⃣ VARIABLES AND CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const API = 'http://localhost:3000/api';  ← API base URL
const user = JSON.parse(sessionStorage.getItem('user') || '{}');  ← Current user
let currentMovieData = null;  ← Stores currently open movie data

// Example movieData structure:
currentMovieData = {
  Content_ID: 1,
  Title: "Avatar",
  Genre: "Sci-Fi, Action",
  Language: "English",
  Duration: 162,
  Age_Rating: "PG-13",
  Poster_Image_URL: "https://...",
  Description: "...",
  IMDB_Rating: 7.8,
  Director: "James Cameron",
  Type: "Movie",
  Cast: "Sam Worthington, Zoe Saldana",
  Release_Date: "2009-12-18"
};


// ═══════════════════════════════════════════════════════════════════════════════
// 8️⃣ COMMON CUSTOMIZATIONS
// ═══════════════════════════════════════════════════════════════════════════════

// CHANGE MODAL MAX WIDTH
.modal-content { max-width: 900px; }  ← Wider
.modal-content { max-width: 600px; }  ← Narrower

// CHANGE ANIMATION SPEED
.modal-overlay { transition: .5s; }  ← Slower
.modal-overlay { transition: .1s; }  ← Faster

@keyframes modalSlideIn { /* change .4s to .2s or .8s */ }

// CHANGE POSTER HEIGHT
.modal-header { height: 400px; }  ← Taller
.modal-header { height: 200px; }  ← Shorter

// CHANGE CLOSE BUTTON COLOR
.close-btn:hover { background: #ff6b6b; }  ← Light red
.close-btn:hover { background: #000; }  ← Black

// ENABLE MODAL WITHOUT API (DEV MODE)
if (!movieData) {
  const mockData = {
    Content_ID: 1,
    Title: "Dev Mode Movie",
    Description: "Testing modal without API",
    // ... full mock data
  };
  populateModal(mockData);
}

// ADD LOADING SKELETON
populateModal() {
  // Show loading state first
  document.getElementById('modalTitle').textContent = '⏳ Loading...';
  // Then replace with actual data after fetch
}


// ═══════════════════════════════════════════════════════════════════════════════

That's the complete modal implementation!

Key takeaways:
✅ Card click → Open modal with animation
✅ Fetch API → Get movie details
✅ Populate DOM → Display information
✅ User actions → Watch, Watchlist, Close
✅ Smooth UX → Animations, notifications, keyboard shortcuts

═══════════════════════════════════════════════════════════════════════════════
