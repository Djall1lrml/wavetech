export default function Done({ params }: any) {
  return <div className="text-center py-20"><h1 className="font-pixel text-neon-c">✔ Commande reçue / تم استلام الطلب</h1><p className="mt-6">Code: <b className="text-neon-c text-xl">{params.code}</b></p><p className="mt-2 opacity-70">Nous vous appelons pour confirmer. سنتصل بك للتأكيد.</p></div>;
}
