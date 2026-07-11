import LoadingLogo from '@/components/LoadingLogo';

export default function Loading() {
  return (
    <div className="center-screen">
      <div className="hex-field" />
      <LoadingLogo label="Chargement…" />
    </div>
  );
}
