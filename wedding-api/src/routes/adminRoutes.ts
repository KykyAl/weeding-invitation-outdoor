import { Router } from 'express'
import {
  createEvent,
  createPhoto,
  createStory,
  createWedding,
  deleteEvent,
  deletePhoto,
  deleteStory,
  deleteWedding,
  getWedding,
  listWeddings,
  updateEvent,
  updatePhoto,
  updateStory,
  updateWedding,
} from '../controllers/weddingController.js'
import { requireAdmin } from '../middleware/auth.js'

export const adminRoutes = Router()

adminRoutes.use(requireAdmin)

adminRoutes.get('/weddings', listWeddings)
adminRoutes.post('/weddings', createWedding)
adminRoutes.get('/weddings/:id', getWedding)
adminRoutes.put('/weddings/:id', updateWedding)
adminRoutes.delete('/weddings/:id', deleteWedding)

adminRoutes.post('/weddings/:id/events', createEvent)
adminRoutes.put('/events/:eventId', updateEvent)
adminRoutes.delete('/events/:eventId', deleteEvent)

adminRoutes.post('/weddings/:id/stories', createStory)
adminRoutes.put('/stories/:storyId', updateStory)
adminRoutes.delete('/stories/:storyId', deleteStory)

adminRoutes.post('/weddings/:id/gallery', createPhoto)
adminRoutes.put('/gallery/:galleryId', updatePhoto)
adminRoutes.delete('/gallery/:galleryId', deletePhoto)
