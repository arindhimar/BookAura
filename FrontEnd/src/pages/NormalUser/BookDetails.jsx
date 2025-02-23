"use client"

import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../../components/ui/button"
import { ArrowLeft } from "lucide-react"
import BookDetailsComponent from "../../components/BookDetailsComponent"
import RelatedBooks from "../../components/RelatedBooks"
import { useEffect } from "react"

export default function BookDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
  } ,[])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="mb-4 hover:bg-primary/10 transition-colors duration-300"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <BookDetailsComponent id={id} />
      <RelatedBooks />
    </motion.div>
  )
}

