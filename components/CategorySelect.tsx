"use client"
import { useState, useEffect } from "react"
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, type SelectChangeEvent } from "@mui/material"
import { useAuth } from "@/contexts/AuthContext"
import { apiRequest } from "@/lib/api"

interface Category {
  _id: string
  title: string
}

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  disabled?: boolean
}

export default function CategorySelect({
  value,
  onChange,
  label = "Category",
  required = false,
  disabled = false,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await apiRequest("/get/categories", {}, token!)
      setCategories(data.categories || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value)
  }

  return (
    <FormControl fullWidth required={required} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={handleChange}>
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading categories...
          </MenuItem>
        ) : categories.length === 0 ? (
          <MenuItem disabled>No categories available</MenuItem>
        ) : (
          categories.map((category) => (
            <MenuItem key={category._id} value={category._id}>
              {category.title}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  )
}
