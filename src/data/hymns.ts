export interface Hymn {
  number: number;
  title: string;
  stanzas: string[];
  chorus?: string[];
}

export const hymns: Hymn[] = [
  {
    number: 1,
    title: "Holy, Holy, Holy",
    stanzas: [
      "Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee;\nHoly, holy, holy! merciful and mighty!\nGod in three persons, blessed Trinity!",
      "Holy, holy, holy! all the saints adore Thee,\nCasting down their golden crowns around the glassy sea;\nCherubim and seraphim falling down before Thee,\nWhich wert, and art, and evermore shalt be.",
      "Holy, holy, holy! though the darkness hide Thee,\nThough the eye of sinful man Thy glory may not see;\nOnly Thou art holy; there is none beside Thee,\nPerfect in power, in love, and purity."
    ]
  },
  {
    number: 2,
    title: "Amazing Grace",
    stanzas: [
      "Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.",
      "Through many dangers, toils and snares,\nI have already come;\n'Tis grace hath brought me safe thus far,\nAnd grace will lead me home.",
      "When we've been there ten thousand years,\nBright shining as the sun,\nWe've no less days to sing God's praise\nThan when we'd first begun."
    ]
  },
  {
    number: 3,
    title: "Great Is Thy Faithfulness",
    stanzas: [
      "Great is Thy faithfulness, O God my Father\nThere is no shadow of turning with Thee\nThou changest not, Thy compassions, they fail not\nAs Thou hast been, Thou forever will be",
      "Summer and winter and springtime and harvest\nSun, moon and stars in their courses above\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy and love",
      "Pardon for sin and a peace that endureth\nThine own dear presence to cheer and to guide\nStrength for today and bright hope for tomorrow\nBlessings all mine, with ten thousand beside"
    ]
  },
  {
    number: 103,
    title: "Anuonyam nka Onyankopɔn",
    stanzas: [
      "Anuonyam nka Onyankopɔn,\nWɔ soro soro hɔ;\nAhotefo nyinaa nka sε,\nAnuonyam nka no daa;",
      "Anuonyam nka Onyankopɔn,\nWɔ soro soro hɔ;\nW'ama ne nkwagye basa so\nAma nnebɔnyεfo.",
      "Anuonyam nka Onyankopɔn,\nWɔ soro soro hɔ;\nMomma yεnmmɔ ose mma no\nNa yεahu ne nkwagye.",
      "Anuonyam nka Onyankopɔn,\nWɔ sorosoro hɔ;\nƆde ne nsεmpa krɔnkrɔn no\nAbε kyekye yεn werε",
      "Anuonyam nka Onyankopɔn,\nWɔ sorosoro hɔ;\nO hwε sεnea Yehowa hyerεn,\nwɔ soro kurow no mu.",
      "Anuonyam nka Onyankopɔn,\nWɔ sorosoro hɔ;\nSε Kristo da ne ho adi a\nYebehu n'anuonyam"
    ],
    chorus: [
      "Anuonyam nka Onyankopɔn",
      "Wɔ soro hɔ;",
      "Anuonyam nka Onyankopɔn,",
      "Wɔ soro soro hɔ."
    ]
  }
];