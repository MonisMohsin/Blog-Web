"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Card,
  CardMedia,
} from "@mui/material"
import { ArrowBack, CloudUpload } from "@mui/icons-material"
import { useAuth } from "@/contexts/AuthContext"
import { apiRequest, apiRequestWithFile } from "@/lib/api"
import ProtectedRoute from "@/components/ProtectedRoute"
import CategorySelect from "@/components/CategorySelect"
import { useRouter, useParams } from "next/navigation"

interface Blog {
  _id: string
  title: string
  description: string
  thumbnail: string
  category: {
    _id: string
    title: string
  }
  user: {
    _id: string
    username: string
  }
}

export default function EditBlogPage() {
  return (
    <ProtectedRoute>
      <EditBlogContent />
    </ProtectedRoute>
  )
}

function EditBlogContent() {
  const [blog, setBlog] = useState<Blog | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const { token, user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const blogId = params.id as string

  useEffect(() => {
    if (blogId) {
      fetchBlog()
    }
  }, [blogId])

  const fetchBlog = async () => {
    try {
      setInitialLoading(true)
      const data = await apiRequest(`/get/blog/${blogId}`, {}, token!)
      const blogData = data.blog

      // Check if user owns this blog
      if (user?._id !== blogData.user._id) {
        setError("You are not authorized to edit this blog")
        return
      }

      setBlog(blogData)
      setTitle(blogData.title)
      setDescription(blogData.description)
      setCategory(blogData.category._id)

      if (blogData.thumbnail) {
        setThumbnailPreview(`http://localhost:8000/${blogData.thumbnail}`)
      }
    } catch (err) {
      setError("Failed to fetch blog")
      console.error("Error fetching blog:", err)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setThumbnail(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !description.trim() || !category) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("description", description.trim())
      formData.append("category", category)
      formData.append("blogId", blogId)

      if (thumbnail) {
        formData.append("thumbnail", thumbnail)
      }

      // Note: This assumes your server has an update endpoint
      // You may need to modify your server to handle blog updates
      await apiRequestWithFile(`/update/blog/${blogId}`, formData, token!)

      router.push("/dashboard")
    } catch (err) {
      setError("Failed to update blog. Please try again.")
      console.error("Error updating blog:", err)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error && !blog) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push("/dashboard")} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    )
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.push("/dashboard")} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Edit Blog: {blog?.title}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Edit Blog Post
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Blog Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />

            <CategorySelect value={category} onChange={setCategory} label="Category" required disabled={loading} />

            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={6}
              required
              disabled={loading}
            />

            {/* Thumbnail Upload */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Thumbnail Image
              </Typography>

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mt: 2, mb: 2 }}
                disabled={loading}
              >
                Change Thumbnail
                <input type="file" accept="image/*" hidden onChange={handleThumbnailChange} />
              </Button>

              {thumbnailPreview && (
                <Card sx={{ mt: 2, maxWidth: 400 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={thumbnailPreview}
                    alt="Thumbnail preview"
                    sx={{ objectFit: "cover" }}
                  />
                </Card>
              )}
            </Box>

            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ minWidth: 120 }}>
                {loading ? <CircularProgress size={24} /> : "Update Blog"}
              </Button>

              <Button variant="outlined" size="large" onClick={() => router.push("/dashboard")} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
