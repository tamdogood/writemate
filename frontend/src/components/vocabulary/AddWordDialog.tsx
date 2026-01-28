'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'

interface AddWordDialogProps {
  onAddWord: (word: {
    word: string
    definition: string
    part_of_speech: string
    example_sentence?: string
  }) => Promise<void>
}

const partsOfSpeech = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'interjection',
]

export function AddWordDialog({ onAddWord }: AddWordDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    part_of_speech: 'noun',
    example_sentence: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await onAddWord({
        word: formData.word.trim(),
        definition: formData.definition.trim(),
        part_of_speech: formData.part_of_speech,
        example_sentence: formData.example_sentence.trim() || undefined,
      })

      setFormData({
        word: '',
        definition: '',
        part_of_speech: 'noun',
        example_sentence: '',
      })
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add word')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Word
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="word">Word *</Label>
            <Input
              id="word"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              placeholder="Enter the word"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Definition *</Label>
            <Textarea
              id="definition"
              value={formData.definition}
              onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
              placeholder="Enter the definition"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="part_of_speech">Part of Speech</Label>
            <Select
              value={formData.part_of_speech}
              onValueChange={(value) => setFormData({ ...formData, part_of_speech: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {partsOfSpeech.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="example">Example Sentence (optional)</Label>
            <Textarea
              id="example"
              value={formData.example_sentence}
              onChange={(e) =>
                setFormData({ ...formData, example_sentence: e.target.value })
              }
              placeholder="Enter an example sentence"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Word'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
