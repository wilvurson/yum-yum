export default function MapEmbed() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <iframe
        src="https://www.google.com/maps/d/u/0/embed?mid=1ZpYKOqp0fLu-MWJK2JvUJFF8wa9yTiU&ehbc=2E312F"
        width="50%"
        height="640px"
        loading="lazy"
        style={{ border: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
