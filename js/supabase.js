/* ============================================
   KONKAN NAVIGATOR — SUPABASE CLIENT
   Single entry point for all Supabase interactions
   ============================================ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://qrvvfjywybfsvojaavou.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFydnZmanl3eWJmc3ZvamFhdm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NDc0MzUsImV4cCI6MjA5MTEyMzQzNX0.d_uGn0htF1xede7j-tXihEMUEtpdAr_TYHnA9oWW1iE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── AUTH HELPERS ────────────────────────────────────────────

export function getAuthErrorMessage(error) {
  const messages = {
    'Invalid login credentials': 'Incorrect email or password.',
    'Email not confirmed': 'Please verify your email before signing in.',
    'User already registered': 'An account with this email already exists.',
    'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
    'Signup requires a valid password': 'Please enter a valid password (min 6 characters).',
    'To signup, please provide your email': 'Please provide a valid email address.'
  }
  return messages[error.message] || error.message || 'Something went wrong. Please try again.'
}

// ─── AUTH ────────────────────────────────────────────────────

export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/index.html' }
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
}

// ─── PROFILES ────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  await updateProfile(userId, { avatar_url: data.publicUrl })
  return data.publicUrl
}

// ─── DESTINATIONS ─────────────────────────────────────────────

export async function getDestinations({ category, district, search, featured, hiddenGem, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from('destinations')
    .select('*')
    .order('avg_rating', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category && category !== 'all') query = query.eq('category', category)
  if (district) query = query.eq('district', district)
  if (featured) query = query.eq('is_featured', true)
  if (hiddenGem) query = query.eq('is_hidden_gem', true)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getDestinationBySlug(slug) {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function getFeaturedDestinations(limit = 4) {
  return getDestinations({ featured: true, limit })
}

export async function getHiddenGems(limit = 10) {
  return getDestinations({ hiddenGem: true, limit })
}

export async function getDestinationCount() {
  const { count, error } = await supabase
    .from('destinations')
    .select('*', { count: 'exact', head: true })
  if (error) return 0
  return count || 0
}

// ─── GUIDES ───────────────────────────────────────────────────

export async function getGuides({ district, language, maxPrice, minRating, limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from('guides')
    .select('*')
    .eq('is_available', true)
    .order('avg_rating', { ascending: false })
    .range(offset, offset + limit - 1)

  if (district) query = query.eq('home_district', district)
  if (maxPrice) query = query.lte('price_per_day', maxPrice)
  if (minRating) query = query.gte('avg_rating', minRating)
  if (language) query = query.contains('languages', [language])

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getGuideById(id) {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getGuideCount() {
  const { count, error } = await supabase
    .from('guides')
    .select('*', { count: 'exact', head: true })
  if (error) return 0
  return count || 0
}

export async function applyAsGuide(applicationData) {
  const user = await getUser()
  const { data, error } = await supabase
    .from('guide_applications')
    .insert({ ...applicationData, user_id: user?.id })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── BOOKINGS ─────────────────────────────────────────────────

export async function createBooking(bookingData) {
  const user = await getUser()
  if (!user) throw new Error('Must be signed in to book a guide')

  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...bookingData, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserBookings() {
  const user = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('bookings')
    .select('*, guides(display_name, profile_image_url), destinations(name, image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function cancelBooking(bookingId) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── TRIPS ────────────────────────────────────────────────────

export async function saveTrip(tripData) {
  const user = await getUser()
  if (!user) throw new Error('Must be signed in to save a trip')

  const { data, error } = await supabase
    .from('trips')
    .insert({ ...tripData, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUserTrips() {
  const user = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateTrip(tripId, updates) {
  const { data, error } = await supabase
    .from('trips')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', tripId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTrip(tripId) {
  const { error } = await supabase.from('trips').delete().eq('id', tripId)
  if (error) throw error
}

// ─── REVIEWS ──────────────────────────────────────────────────

export async function getReviewsForDestination(destinationId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('destination_id', destinationId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getReviewsForGuide(guideId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('guide_id', guideId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function submitReview(reviewData) {
  const user = await getUser()
  if (!user) throw new Error('Must be signed in to leave a review')

  const { data, error } = await supabase
    .from('reviews')
    .insert({ ...reviewData, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── FEEDBACK ─────────────────────────────────────────────────

export async function submitFeedback(feedbackData) {
  const user = await getUser()
  const { data, error } = await supabase
    .from('feedback')
    .insert({ ...feedbackData, user_id: user?.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getFeedbackSummary() {
  const { data, error } = await supabase
    .from('feedback')
    .select('star_rating, liked_features, would_recommend')
  if (error) throw error

  if (!data || data.length === 0) {
    return { avgRating: '0.0', total: 0, featureCounts: {} }
  }

  const avgRating = data.reduce((sum, f) => sum + (f.star_rating || 0), 0) / data.length
  const featureCounts = {}
  data.forEach(f => {
    (f.liked_features || []).forEach(feat => {
      featureCounts[feat] = (featureCounts[feat] || 0) + 1
    })
  })
  return { avgRating: avgRating.toFixed(1), total: data.length, featureCounts }
}

// ─── CONTACT ──────────────────────────────────────────────────

export async function submitContactMessage(messageData) {
  const user = await getUser()
  const { data, error } = await supabase
    .from('contact_messages')
    .insert({ ...messageData, user_id: user?.id })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── TRANSPORT ────────────────────────────────────────────────

export async function getTransportRoutes(from, to) {
  let query = supabase.from('transport_routes').select('*')
  if (from) query = query.ilike('from_location', `%${from}%`)
  if (to) query = query.ilike('to_location', `%${to}%`)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

// ─── REALTIME ─────────────────────────────────────────────────

export function subscribeToBookingUpdates(userId, callback) {
  return supabase
    .channel('booking-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'bookings',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe()
}
