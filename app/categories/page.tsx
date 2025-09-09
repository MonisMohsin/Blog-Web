"use client"
import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Fab,
} from "@mui/material"
import { ArrowBack, Add as AddIcon, Category as CategoryIcon } from "@mui/icons-material"
import { useAuth } from "@/contexts/AuthContext"
import { apiRequest } from "@/lib/api"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useRouter } from "next/navigation"

interface Category {
  _id: string
  title: string
}

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <CategoriesContent />
    </ProtectedRoute>
  )
}

function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await apiRequest("/get/categories", {}, token!)
      setCategories(data.categories || [])
    } catch (err) {
      setError("Failed to fetch categories")
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryTitle.trim()) {
      return
    }

    try {
      setSubmitting(true)
      await apiRequest(
        "/add/categories",
        {
          method: "POST",
          body: JSON.stringify({ title: newCategoryTitle.trim() }),
        },
        token!,
      )

      setNewCategoryTitle("")
      setOpen(false)
      fetchCategories() // Refresh the list
    } catch (err) {
      setError("Failed to add category")
      console.error("Error adding category:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setNewCategoryTitle("")
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.push("/dashboard")} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <CategoryIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Category Management
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            Categories
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add Category
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Box textAlign="center" mt={4}>
            <CategoryIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No categories found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create your first category to organize your blog posts
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              Add Category
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                    <CategoryIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                    <Typography variant="h6" component="h2" gutterBottom>
                      {category.title}
                    </Typography>
                    <Chip label="Category" size="small" color="primary" variant="outlined" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Action Button for mobile */}
        <Fab
          color="primary"
          aria-label="add category"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            display: { xs: "flex", sm: "none" },
          }}
          onClick={() => setOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Container>

      {/* Add Category Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Title"
            fullWidth
            variant="outlined"
            value={newCategoryTitle}
            onChange={(e) => setNewCategoryTitle(e.target.value)}
            disabled={submitting}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddCategory()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleAddCategory} variant="contained" disabled={submitting || !newCategoryTitle.trim()}>
            {submitting ? <CircularProgress size={20} /> : "Add Category"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
