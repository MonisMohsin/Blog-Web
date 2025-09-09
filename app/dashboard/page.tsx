"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material"
import { Add as AddIcon, AccountCircle, Logout, Category as CategoryIcon } from "@mui/icons-material"
import { useAuth } from "@/contexts/AuthContext"
import { apiRequest } from "@/lib/api"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useRouter } from "next/navigation"

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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, logout, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const data = await apiRequest("/get/allblog", {}, token!)
      setBlogs(data.blogs || [])
    } catch (err) {
      setError("Failed to fetch blogs")
      console.error("Error fetching blogs:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleViewBlog = (blogId: string) => {
    router.push(`/blog/${blogId}`)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Blog Management System
          </Typography>

          <Button
            color="inherit"
            startIcon={<CategoryIcon />}
            onClick={() => router.push("/categories")}
            sx={{ mr: 2 }}
          >
            Categories
          </Button>

          <Button color="inherit" startIcon={<AddIcon />} onClick={() => router.push("/blog/create")} sx={{ mr: 2 }}>
            New Blog
          </Button>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <Typography textAlign="center">Hello, {user?.username}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Blogs
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : blogs.length === 0 ? (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No blogs found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create your first blog post to get started
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push("/blog/create")}>
              Create Blog
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {blogs.map((blog) => (
              <Grid item xs={12} sm={6} md={4} key={blog._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => handleViewBlog(blog._id)}
                >
                  {blog.thumbnail && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={`http://localhost:8000/${blog.thumbnail}`}
                      alt={blog.title}
                      sx={{ objectFit: "cover" }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {blog.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {blog.description}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      {blog.category && (
                        <Chip label={blog.category.title} size="small" color="primary" variant="outlined" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        By {blog.user.username}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}
