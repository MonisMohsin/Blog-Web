"use client";
import type React from "react";
import { useState } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
} from "@mui/material";
import {
  ArrowBack,
  CloudUpload,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequestWithFile } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

export default function CreateBlogPage() {
  return (
    <ProtectedRoute>
      <CreateBlogContent />
    </ProtectedRoute>
  );
}

function CreateBlogContent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();
  const router = useRouter();

  const handleThumbnailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !category) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category);

      if (user?.id) {
        formData.append("userId", user.id);
      }

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      await apiRequestWithFile("/add/blog", formData, token!);

      router.push("/dashboard");
    } catch (err) {
      setError("Failed to create blog. Please try again.");
      console.error("Error creating blog:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push("/dashboard")}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Create New Blog
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Create New Blog Post
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

            {/* Category Dropdown */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                required
              >
                <MenuItem value="tech">Tech</MenuItem>
                <MenuItem value="health">Health</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
              </Select>
            </FormControl>

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

              <FormControl fullWidth>
                <InputLabel htmlFor="thumbnail-upload" shrink>
                  Upload Thumbnail
                </InputLabel>
                <Input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={loading}
                  sx={{ mt: 2 }}
                />
              </FormControl>

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{ mt: 2, mb: 2 }}
                disabled={loading}
              >
                Choose Thumbnail
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleThumbnailChange}
                />
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

              {!thumbnailPreview && (
                <Box
                  sx={{
                    mt: 2,
                    p: 4,
                    border: "2px dashed",
                    borderColor: "grey.300",
                    borderRadius: 2,
                    textAlign: "center",
                    backgroundColor: "grey.50",
                  }}
                >
                  <ImageIcon sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No thumbnail selected
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : "Create Blog"}
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/dashboard")}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
