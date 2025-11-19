
    steps: {
      // queries
      listByProject: typeof import("../steps").listByProject;
      // mutations
      create: typeof import("../steps").create;
      remove: typeof import("../steps").remove;
      toggleComplete: typeof import("../steps").toggleComplete;
      update: typeof import("../steps").update;
    };
