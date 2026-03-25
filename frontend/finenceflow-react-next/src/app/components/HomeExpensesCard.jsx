import styles from "./HomeExpensesCard.module.css";

export default function HomeExpensesCard({ data, formatFromHuf }) {
  const formatMoney = formatFromHuf ?? ((v) => `${Number(v || 0).toLocaleString("hu-HU")} Ft`);
  if (!data) {
    return (
      <div className={styles.card}>
        <div className={styles.loading}>Nem sikerült betölteni.</div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Kiadások</div>
          <div className={styles.sub}>
            {data.year}.{String(data.month).padStart(2, "0")}
          </div>
        </div>

        <div className={styles.total}>-{formatMoney(data.total)}</div>
      </div>

      <div className={styles.tableHeader}>
        <div>Leírás</div>
        <div>Dátum</div>
        <div>Kategória</div>
        <div style={{ textAlign: "right" }}>Nettó tranzakció</div>
      </div>

      {data.categories.length === 0 ? (
        <div className={styles.empty}>Ebben a hónapban még nincs költés.</div>
      ) : (
        data.categories.map((c) => (
          <div key={c.category} className={styles.categoryBlock}>
            <div className={styles.categoryHeader}>
              <span>{c.category}</span>
              <span className={styles.categoryTotal}>
                -{formatMoney(c.categoryTotal)}
              </span>
            </div>

            <div className={styles.rows}>
              {c.items.map((e) => (
                <div key={e.id} className={styles.row}>
                  <div className={styles.name}>{e.name}</div>
                  <div className={styles.date}>
                    {new Date(e.createdAt).toLocaleDateString("hu-HU", {
                      month: "short",
                      day: "2-digit",
                    })}
                  </div>
                  <div className={styles.category}>{c.category}</div>
                  <div className={styles.amount}>
                    -{formatMoney(e.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
