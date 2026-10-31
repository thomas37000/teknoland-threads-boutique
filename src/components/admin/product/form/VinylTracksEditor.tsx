import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormRow } from "./FormRow";

const AUDIO_ACCEPT =
  ".mp3,.wav,.flac,.aac,.aiff,.aif,audio/mpeg,audio/wav,audio/x-wav,audio/flac,audio/aac,audio/aiff,audio/x-aiff";

const FIELDS = [
  { key: "name", label: "Nom de la piste", placeholder: "Titre de la chanson" },
  { key: "duration", label: "Durée (MM:SS)", placeholder: "3:45" },
  { key: "artist", label: "Artiste", placeholder: "Nom de l'artiste" },
  { key: "year", label: "Année", placeholder: "2024" },
] as const;

/** Pistes d'un vinyle avec upload audio par piste. */
export function VinylTracksEditor({
  tracks = [], onUpdate, onAudioUpload,
}: {
  tracks: any[];
  onUpdate: (index: number, field: string, value: string) => void;
  onAudioUpload?: (index: number, file: File) => void;
}) {
  return (
    <FormRow label="Pistes" align="start">
      <div className="space-y-4">
        {tracks.map((track, index) => (
          <div key={track.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <h4 className="font-medium">Piste {track.id}</h4>
            <div className="grid grid-cols-4 gap-3">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <Label className="text-sm">{f.label}</Label>
                  <Input value={track[f.key]} onChange={(e) => onUpdate(index, f.key, e.target.value)} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Fichier audio</Label>
              <Input
                type="file"
                accept={AUDIO_ACCEPT}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAudioUpload?.(index, file);
                }}
              />
              <p className="text-xs text-muted-foreground">Formats acceptés : MP3, WAV, FLAC, AAC, AIFF. Max 50MB.</p>
              {track.audioUrl && <audio controls src={track.audioUrl} className="w-full mt-1" />}
            </div>
          </div>
        ))}
      </div>
    </FormRow>
  );
}
