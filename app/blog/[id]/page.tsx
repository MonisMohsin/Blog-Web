"use client"
import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material"
import { ArrowBack, Edit, Delete } from "@mui/icons-material"
import { useAuth } from "@/contexts/AuthContext"
import { apiRequest } from "@/lib/api"
import ProtectedRoute from "@/components/ProtectedRoute"
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

export default function BlogDetailPage() {
  return (
    <ProtectedRoute>
      <BlogDetailContent />
    </ProtectedRoute>
  )
}

function BlogDetailContent() {
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
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
      setLoading(true)
      const data = await apiRequest(`/get/blog/${blogId}`, {}, token!)
      setBlog(data.blog)
    } catch (err) {
      setError("Failed to fetch blog")
      console.error("Error fetching blog:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !blog) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || "Blog not found"}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push("/dashboard")} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    )
  }

  const isOwner = user?._id === blog.user._id

  return (
    <Box>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.push("/dashboard")} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {blog.title}
          </Typography>

          {isOwner && (
            <>
              <Button
                color="inherit"
                startIcon={<Edit />}
                onClick={() => router.push(`/blog/edit/${blog._id}`)}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                color="inherit"
                startIcon={<Delete />}
                onClick={() => {
                  /* TODO: Implement delete */
                }}
              >
                Delete
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card>
          {blog.thumbnail && (
            <CardMedia
              component="img"
              height="400"
              image={`http://localhost:8000/${blog.thumbnail}`}
              alt={blog.title}
              sx={{ objectFit: "cover" }}
            />
          )}
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1">
                {blog.title}
              </Typography>
              {blog.category && <Chip label={blog.category.title} color="primary" variant="outlined" />}
            </Box>

            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              By {blog.user.username}
            </Typography>

            <Typography variant="body1" sx={{ mt: 3, lineHeight: 1.8 }}>
              {blog.description}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
